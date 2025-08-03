import React, { useState, useEffect } from 'react'
import { Award, Trophy, Medal, Star, Target, Calendar, Users, TrendingUp, Crown, Zap, Activity, BarChart3, Clock, MapPin, Flag } from 'lucide-react'
import { useAirtable } from '@/hooks/useAirtable'

interface LogroDestacado {
  id: string
  jugador_nombre: string
  categoria_logro: string
  valor_numerico: number
  temporada_ano: string
  descripcion: string
  fecha_logro: string
  foto_jugador?: { url: string }[]
  foto_momento?: { url: string }[]
  activo: boolean
  orden_importancia: number
}

export function AchievementsSection() {
  const { data: logros, loading, error } = useAirtable('Logros_Destacados')
  const { data: trayectoria, loading: loadingTrayectoria, error: errorTrayectoria } = useAirtable('Trayectoria_Historia')
  
  // Función para obtener el ícono según la categoría
  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'Mejor Promedio General': return BarChart3
      case 'Mejor Promedio con Handicap': return TrendingUp
      case 'Juego Perfecto (300)': return Target
      case 'Más Torneos Ganados': return Trophy
      case 'Mejor Promedio Temporada': return Activity
      case 'Ganador Torneo': return Medal
      case 'Más Títulos Acumulados': return Crown
      case 'Más Torneos Participados': return Users
      case 'Veterano Destacado': return Star
      default: return Award
    }
  }

  // Función para obtener el color según la categoría
  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'Mejor Promedio General': return 'from-blue-500 to-blue-600'
      case 'Mejor Promedio con Handicap': return 'from-green-500 to-green-600'
      case 'Juego Perfecto (300)': return 'from-yellow-500 to-yellow-600'
      case 'Más Torneos Ganados': return 'from-purple-500 to-purple-600'
      case 'Mejor Promedio Temporada': return 'from-indigo-500 to-indigo-600'
      case 'Ganador Torneo': return 'from-orange-500 to-orange-600'
      case 'Más Títulos Acumulados': return 'from-red-500 to-red-600'
      case 'Más Torneos Participados': return 'from-teal-500 to-teal-600'
      case 'Veterano Destacado': return 'from-amber-500 to-amber-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  // Filtrar logros activos y ordenar por importancia
  const logrosActivos = (logros || []).filter((logro: any) => logro.fields?.activo)
  
  // Obtener logros por categoría
  const getLogrosPorCategoria = (categoria: string) => {
    return logrosActivos
      .filter((logro: any) => logro.fields?.categoria_logro === categoria)
      .sort((a: any, b: any) => (a.fields?.orden_importancia || 0) - (b.fields?.orden_importancia || 0))
  }

  // Obtener los 3 juegos perfectos
  const juegosPerfectos = getLogrosPorCategoria('Juego Perfecto (300)')
  
  // Obtener estadísticas generales
  const totalLogros = logrosActivos.length
  const jugadoresUnicos = [...new Set(logrosActivos.map((l: any) => l.fields?.jugador_nombre))].length
  
  // Procesar datos de trayectoria
  const trayectoriaActiva = (trayectoria || []).filter((evento: any) => evento.fields?.activo)
  
  // DEBUG: Verificar qué campos están llegando desde Airtable
  console.log('=== DEBUG TRAYECTORIA_HISTORIA ===')
  console.log('Total eventos:', trayectoriaActiva.length)
  if (trayectoriaActiva.length > 0) {
    console.log('Primer evento completo:', trayectoriaActiva[0])
    console.log('Campos disponibles:', Object.keys(trayectoriaActiva[0].fields || {}))
    console.log('fecha_inicio:', trayectoriaActiva[0].fields?.fecha_inicio)
    console.log('fecha_fin:', trayectoriaActiva[0].fields?.fecha_fin)
    console.log('nombre_torneo:', trayectoriaActiva[0].fields?.nombre_torneo)
    console.log('participantes:', trayectoriaActiva[0].fields?.participantes)
  }
  console.log('===================================')

  // Función para formatear rango de fechas
  const formatearRangoFechas = (fechaInicio: string, fechaFin?: string) => {
    if (!fechaInicio) return 'Fecha no especificada'
    
    const inicio = new Date(fechaInicio)
    const fin = fechaFin ? new Date(fechaFin) : null
    
    const opciones: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }
    
    if (!fin || inicio.getTime() === fin.getTime()) {
      return inicio.toLocaleDateString('es-ES', opciones)
    }
    
    // Si es el mismo mes y año, mostrar "15-17 Marzo 2024"
    if (inicio.getMonth() === fin.getMonth() && inicio.getFullYear() === fin.getFullYear()) {
      return `${inicio.getDate()}-${fin.getDate()} ${inicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    }
    
    // Si es el mismo año, mostrar "15 Marzo - 2 Abril 2024"
    if (inicio.getFullYear() === fin.getFullYear()) {
      return `${inicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - ${fin.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
    }
    
    // Fechas en años diferentes
    return `${inicio.toLocaleDateString('es-ES', opciones)} - ${fin.toLocaleDateString('es-ES', opciones)}`
  }

  // Agrupar eventos por período (año-mes para mejor organización)
  const eventosPorPeriodo: { [key: string]: any[] } = {}
  if (trayectoria) {
    trayectoria.forEach((evento: any) => {
      let periodo: string
      
      if (evento.fields?.fecha_inicio) {
        // Si tiene fecha_inicio, usar esa fecha
        const fecha = new Date(evento.fields.fecha_inicio)
        periodo = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      } else {
        // Si no tiene fecha_inicio, usar solo el año (mes 01 por defecto)
        const ano = evento.fields?.ano || '2024'
        periodo = `${ano}-01`
      }
      
      if (!eventosPorPeriodo[periodo]) {
        eventosPorPeriodo[periodo] = []
      }
      eventosPorPeriodo[periodo].push(evento)
    })
  }

  // Función para obtener ícono según tipo de evento
  const getTipoEventoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Fundación': return Flag
      case 'Torneo Importante': return Trophy
      case 'Récord Establecido': return Target
      case 'Crecimiento': return TrendingUp
      case 'Innovación': return Zap
      case 'Reconocimiento': return Medal
      case 'Milestone': return Star
      default: return Clock
    }
  }
  
  // Función para obtener color según impacto
  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'Alto': return 'from-red-500 to-red-600'
      case 'Medio': return 'from-yellow-500 to-yellow-600'
      case 'Bajo': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bowling-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando logros destacados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Error al cargar los logros</p>
        </div>
      </div>
    )
  }

  const oldAchievements = [
    {
      id: 1,
      title: "Campeón Nacional 2023",
      description: "Primer lugar en el Torneo Nacional de Boliche Nicaragua",
      date: "Diciembre 2023",
      category: "Torneo Nacional",
      icon: Trophy,
      color: "from-yellow-400 to-yellow-600"
    },
    {
      id: 2,
      title: "Perfect Game - 300 Puntos",
      description: "Juego perfecto logrado en el torneo regional",
      date: "Octubre 2023",
      category: "Logro Personal",
      icon: Target,
      color: "from-green-400 to-green-600"
    },
    {
      id: 3,
      title: "Mejor Promedio del Año",
      description: "Promedio más alto de la temporada 2023",
      date: "Noviembre 2023",
      category: "Estadística",
      icon: TrendingUp,
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 4,
      title: "Subcampeón Regional",
      description: "Segundo lugar en el campeonato regional",
      date: "Septiembre 2023",
      category: "Torneo Regional",
      icon: Medal,
      color: "from-gray-400 to-gray-600"
    }
  ]

  const milestones = [
    {
      year: "2023",
      events: [
        "Fundación de la comunidad Boliche Nicaragua",
        "Primer torneo oficial organizado",
        "50+ jugadores registrados"
      ]
    },
    {
      year: "2022",
      events: [
        "Inicio de actividades regulares",
        "Primeras competencias amistosas",
        "Establecimiento de reglas y handicaps"
      ]
    }
  ]

  const stats = [
    { label: "Torneos Organizados", value: "15+", icon: Trophy },
    { label: "Jugadores Activos", value: "80+", icon: Users },
    { label: "Juegos Perfectos", value: "8", icon: Target },
    { label: "Años de Historia", value: "2+", icon: Calendar }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
            🏆 Logros y Trayectoria
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Celebramos los momentos más destacados y la evolución de nuestra comunidad de boliche
          </p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{totalLogros}</div>
            <div className="text-xs sm:text-sm text-gray-600">Logros Registrados</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{jugadoresUnicos}</div>
            <div className="text-xs sm:text-sm text-gray-600">Jugadores Destacados</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{juegosPerfectos.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Juegos Perfectos</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">2023</div>
            <div className="text-xs sm:text-sm text-gray-600">Temporada Actual</div>
          </div>
        </div>

        {/* Juegos Perfectos Destacados */}
        {juegosPerfectos.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center px-4">
              🎯 Juegos Perfectos (300 Puntos)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {juegosPerfectos.map((logro: any, index: number) => {
                const IconComponent = Target
                const fotoJugador = logro.fields?.foto_jugador?.[0]?.url
                const fotoMomento = logro.fields?.foto_momento?.[0]?.url
                
                return (
                  <div key={logro.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                    <div className="h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
                    
                    {/* Foto del momento si existe */}
                    {fotoMomento && (
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <img 
                          src={fotoMomento} 
                          alt={`Momento del juego perfecto de ${logro.fields?.jugador_nombre}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          PERFECT GAME
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6">
                      <div className="text-center">
                        {/* Foto del jugador o ícono */}
                        {fotoJugador ? (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden border-3 sm:border-4 border-yellow-500">
                            <img 
                              src={fotoJugador} 
                              alt={logro.fields?.jugador_nombre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                        )}
                        
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                          {logro.fields?.jugador_nombre}
                        </h3>
                        <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2">
                          {logro.fields?.valor_numerico}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 px-2">
                          {logro.fields?.descripcion}
                        </p>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {new Date(logro.fields?.fecha_logro).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Logros por Categoría */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center px-4">
            🏅 Logros por Categoría
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {['Mejor Promedio General', 'Mejor Promedio con Handicap', 'Más Torneos Ganados', 'Veterano Destacado', 'Más Torneos Participados'].map((categoria) => {
              const logrosCategoria = getLogrosPorCategoria(categoria)
              if (logrosCategoria.length === 0) return null
              
              const logro = logrosCategoria[0] // Tomar el primero (más importante)
              const IconComponent = getCategoryIcon(categoria)
              const colorClass = getCategoryColor(categoria)
              
              const fotoJugador = logro.fields?.foto_jugador?.[0]?.url
              const fotoMomento = logro.fields?.foto_momento?.[0]?.url
              
              return (
                <div key={categoria} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className={`h-2 bg-gradient-to-r ${colorClass}`}></div>
                  
                  {/* Foto del momento si existe */}
                  {fotoMomento && (
                    <div className="relative h-40 sm:h-44 overflow-hidden">
                      <img 
                        src={fotoMomento} 
                        alt={`Momento del logro de ${logro.fields?.jugador_nombre}`}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 right-2 bg-gradient-to-r ${colorClass} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                        {categoria.split(' ')[0]}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Foto del jugador o ícono */}
                      {fotoJugador ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img 
                            src={fotoJugador} 
                            alt={logro.fields?.jugador_nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 truncate">
                          {categoria}
                        </h3>
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                          {logro.fields?.jugador_nombre}
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                          {logro.fields?.valor_numerico}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                          {logro.fields?.descripcion}
                        </p>
                        <div className="text-xs text-gray-500">
                          {logro.fields?.temporada_ano} • {new Date(logro.fields?.fecha_logro).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Línea de Tiempo - Nuestra Trayectoria */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center px-4">
            📅 Nuestra Trayectoria
          </h2>
          
          {loadingTrayectoria ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historia...</p>
            </div>
          ) : errorTrayectoria ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Error al cargar la trayectoria</p>
            </div>
          ) : Object.keys(eventosPorPeriodo).length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay eventos de trayectoria disponibles</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {Object.keys(eventosPorPeriodo)
                .sort((a, b) => a.localeCompare(b))
                .map((periodo, index, array) => {
                  const eventos = eventosPorPeriodo[periodo]
                  const [ano, mes] = periodo.split('-')
                  
                  return (
                    <div key={periodo} className="relative">
                      {/* Línea vertical */}
                      {index < array.length - 1 && (
                        <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-bowling-orange-300 to-transparent"></div>
                      )}
                      
                      <div className="flex items-start space-x-4 sm:space-x-6 mb-8 sm:mb-12">
                        {/* Período */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg flex-shrink-0 z-10">
                          <div className="text-center">
                            <div className="text-xs sm:text-sm">{mes}</div>
                            <div className="text-xs">{ano}</div>
                          </div>
                        </div>
                        
                        {/* Eventos del período */}
                        <div className="flex-1">
                          {eventos.map((evento: any) => {
                            const fechaInicio = evento.fields?.fecha_inicio
                            const fechaFin = evento.fields?.fecha_fin
                            const nombreTorneo = evento.fields?.nombre_torneo || evento.fields?.titulo
                            const fotoEvento = evento.fields?.foto_evento?.[0]?.url
                            
                            return (
                              <div key={evento.id} className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 hover:shadow-xl transition-shadow duration-300">
                                {/* Foto del evento si existe */}
                                {fotoEvento && (
                                  <div className="h-48 sm:h-56 overflow-hidden">
                                    <img 
                                      src={fotoEvento} 
                                      alt={nombreTorneo || 'Evento de la historia'}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                )}
                                
                                <div className="p-4 sm:p-6">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="text-bowling-orange-600">
                                        {React.createElement(getTipoEventoIcon(evento.fields?.tipo_evento), { className: "w-4 h-4" })}
                                      </div>
                                      <span className="text-sm text-bowling-orange-600 font-medium">
                                        {evento.fields?.tipo_evento || 'Evento'}
                                      </span>
                                    </div>
                                    
                                    {/* Rango de fechas */}
                                    {fechaInicio && (
                                      <div className="bg-bowling-orange-50 px-3 py-1 rounded-full">
                                        <span className="text-xs sm:text-sm text-bowling-orange-700 font-medium">
                                          {formatearRangoFechas(fechaInicio, fechaFin)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                                    {nombreTorneo}
                                  </h3>
                                  
                                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3">
                                    {evento.fields?.descripcion}
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                    {evento.fields?.ubicacion && (
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{evento.fields.ubicacion}</span>
                                      </div>
                                    )}
                                    
                                    {evento.fields?.participantes && (
                                      <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4" />
                                        <span>{evento.fields.participantes} participantes</span>
                                      </div>
                                    )}
                                    
                                    {evento.fields?.impacto && (
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        evento.fields.impacto === 'Alto' ? 'bg-red-100 text-red-800' :
                                        evento.fields.impacto === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        Impacto {evento.fields.impacto}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>

        {/* Mensaje de Motivación */}
        <div className="bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 rounded-xl shadow-xl p-8 text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-4">
            ¡Seguimos Creciendo Juntos!
          </h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Cada strike, cada spare, cada momento compartido nos acerca más a nuestros objetivos. 
            La historia de Boliche Nicaragua apenas comienza, y tú eres parte fundamental de ella.
          </p>
        </div>
      </div>
    </div>
  )
}
