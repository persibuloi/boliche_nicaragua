import React, { useState } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { BracketTournamentSection } from './BracketTournamentSection'
import { 
  Users, 
  Trophy, 
  BarChart3,
  ChevronRight,
  Info,
  FileText,
  Download,
  Search,
  X,
  User,
  Target,
  TrendingUp,
  PieChart
} from 'lucide-react'

// Configuración de tablas disponibles
const AVAILABLE_TABLES = [
  { 
    id: 'Lista Jugadores', 
    name: 'Lista Jugadores', 
    icon: Users, 
    description: 'Listado completo con handicap, pago y estadísticas de jugadores',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'Jugador', 
    name: 'Promedios Jugador', 
    icon: Trophy, 
    description: 'Información detallada de jugadores con handicap y estadísticas',
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'Graficos Jugadores', 
    name: 'Gráficos Jugadores', 
    icon: PieChart, 
    description: 'Gráficos comparativos de promedios con y sin handicap',
    color: 'from-orange-500 to-red-600'
  },
  { 
    id: 'Informacion', 
    name: 'Información', 
    icon: Info, 
    description: 'Información dinámica y anuncios sobre los torneos relámpago',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'Torneo Brackets', 
    name: 'Brackets', 
    icon: Target, 
    description: 'Sistema de eliminación por brackets (8 jugadores, 4 líneas)',
    color: 'from-red-500 to-pink-600'
  }
]

interface TableViewProps {
  tableName: string
  tableConfig: typeof AVAILABLE_TABLES[0]
}

function TableView({ tableName, tableConfig }: TableViewProps) {
  // Si es el torneo por brackets, renderizar el componente específico
  if (tableName === 'Torneo Brackets') {
    return <BracketTournamentSection />
  }

  // Para gráficos, usar la tabla 'Jugador'
  const actualTableName = tableName === 'Graficos Jugadores' ? 'Jugador' : tableName
  const { data, loading, error } = useAirtable(actualTableName, {
    maxRecords: 100
  })
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [sortBy, setSortBy] = useState<'PromedioHDC' | 'Promedio' | 'Name' | 'Maximo' | 'Total Pines'>('PromedioHDC')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  // Estados específicos para gráficos
  const [graphicsSortBy, setGraphicsSortBy] = useState<'PromedioHDC' | 'Promedio' | 'Name' | 'diferencia'>('PromedioHDC')
  const [graphicsSortOrder, setGraphicsSortOrder] = useState<'asc' | 'desc'>('desc')

  const IconComponent = tableConfig.icon

  // Filtrar datos basado en la búsqueda
  const filteredData = data.filter(record => {
    if (!searchFilter.trim()) return true
    const searchTerm = searchFilter.toLowerCase()
    const playerName = (record.fields.Jugador || record.fields.Name || '').toLowerCase()
    return playerName.includes(searchTerm)
  })

  // Filtrar datos específicamente para tabla Jugador
  const filteredJugadorData = data.filter(record => {
    if (!searchFilter.trim()) return true
    const searchTerm = searchFilter.toLowerCase()
    const playerName = (record.fields.Name || '').toLowerCase()
    return playerName.includes(searchTerm)
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Error al cargar {tableConfig.name}</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    )
  }

  // Renderizado específico para Lista Jugadores
  const renderListaJugadores = () => (
    <div className="space-y-3">
      {filteredData.slice(0, 20).map((record, index) => (
        <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-bowling-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              {index + 1}
            </div>
            <div>
              <p className="font-semibold text-bowling-black-900">
                {record.fields.Jugador || 'Sin nombre'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  record.fields.Pago === 'Si' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  Pago: {record.fields.Pago || 'No'}
                </span>
                <span>HDC: {record.fields.hdc || 0}</span>
                <span>H.Actual: {record.fields['Handicap Actual'] || 0}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-bowling-orange-500">
              {record.fields['Promedio Mejorado'] || 0}
            </p>
            <p className="text-xs text-gray-500">
              Desv: {record.fields.Desviacion || 0}
            </p>
          </div>
        </div>
      ))}
    </div>
  )

  // Renderizado específico para Jugador
  const renderJugador = () => {
    // Ordenar según el criterio seleccionado
    const sortedData = [...filteredJugadorData].sort((a, b) => {
      let valueA: number | string = 0
      let valueB: number | string = 0
      
      switch (sortBy) {
        case 'PromedioHDC':
          // Parsing del PromedioHDC respetando el valor 0 como válido
          const promedioHDCA = a.fields.PromedioHDC
          const promedioHDCB = b.fields.PromedioHDC
          valueA = typeof promedioHDCA === 'number' ? promedioHDCA : parseFloat(String(promedioHDCA ?? '0'))
          valueB = typeof promedioHDCB === 'number' ? promedioHDCB : parseFloat(String(promedioHDCB ?? '0'))
          break
        case 'Promedio':
          const promedioA = a.fields.Promedio
          const promedioB = b.fields.Promedio
          valueA = typeof promedioA === 'number' ? promedioA : parseFloat(String(promedioA || '0')) || 0
          valueB = typeof promedioB === 'number' ? promedioB : parseFloat(String(promedioB || '0')) || 0
          break
        case 'Name':
          valueA = (a.fields.Name || '').toLowerCase()
          valueB = (b.fields.Name || '').toLowerCase()
          break
        case 'Maximo':
          const maximoA = a.fields.Maximo
          const maximoB = b.fields.Maximo
          valueA = typeof maximoA === 'number' ? maximoA : parseFloat(String(maximoA || '0')) || 0
          valueB = typeof maximoB === 'number' ? maximoB : parseFloat(String(maximoB || '0')) || 0
          break
        case 'Total Pines':
          const totalA = a.fields['Total Pines']
          const totalB = b.fields['Total Pines']
          valueA = typeof totalA === 'number' ? totalA : parseFloat(String(totalA || '0')) || 0
          valueB = typeof totalB === 'number' ? totalB : parseFloat(String(totalB || '0')) || 0
          break
        default:
          const defaultA = a.fields.PromedioHDC
          const defaultB = b.fields.PromedioHDC
          valueA = typeof defaultA === 'number' ? defaultA : parseFloat(String(defaultA || '0')) || 0
          valueB = typeof defaultB === 'number' ? defaultB : parseFloat(String(defaultB || '0')) || 0
      }
      
      // Ordenamiento para strings (nombres)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'desc' ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
      }
      
      // Ordenamiento para números - asegurar que son números válidos
      const numA = Number(valueA) || 0
      const numB = Number(valueB) || 0
      
      return sortOrder === 'desc' ? numB - numA : numA - numB
    })

    return (
      <div className="space-y-3">
        {/* Barra de búsqueda y filtros para Jugador */}
        <div className="mb-4 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar jugador por nombre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Filtros de ordenamiento */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent bg-white"
              >
                <option value="PromedioHDC">Promedio HDC</option>
                <option value="Promedio">Promedio</option>
                <option value="Name">Nombre</option>
                <option value="Maximo">Puntaje Máximo</option>
                <option value="Total Pines">Total Pines</option>
              </select>
            </div>
            
            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent bg-white"
              >
                <option value="desc">Mayor a menor</option>
                <option value="asc">Menor a mayor</option>
              </select>
            </div>
          </div>
          
          {searchFilter && (
            <p className="text-sm text-gray-600">
              Mostrando {sortedData.length} de {data.length} jugadores
            </p>
          )}
        </div>

        {sortedData.slice(0, 24).map((record, index) => (
          <div 
            key={record.id} 
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md hover:bg-gray-100 transition-all cursor-pointer border-2 border-transparent hover:border-bowling-orange-200"
            onClick={() => setSelectedPlayer(record)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-bowling-black-900">
                    {record.fields.Name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-gray-600">
                    HDC: {record.fields.hdc || 0} | Pista: {record.fields.Pista || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-bowling-blue-500">
                  {record.fields.PromedioHDC ?? 0}
                </p>
                <p className="text-xs text-gray-500">
                  Promedio: {record.fields.Promedio || 0}
                </p>
              </div>
            </div>
            
            {/* Líneas de juego - Ahora con 6 columnas */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-gray-500">L1</p>
                <p className="font-semibold">{record.fields.L1 || 0}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-gray-500">L2</p>
                <p className="font-semibold">{record.fields.L2 || 0}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-gray-500">L3</p>
                <p className="font-semibold">{record.fields.L3 || 0}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-gray-500">L4</p>
                <p className="font-semibold">{record.fields.L4 || 0}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-gray-500">L5</p>
                <p className="font-semibold">{record.fields.L5 || 0}</p>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <p className="text-xs text-gray-500">L6</p>
                <p className="font-semibold">{record.fields.L6 || 0}</p>
              </div>
            </div>
            
            {/* Estadísticas adicionales */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Min: {record.fields.Minimo || 0}</span>
              <span>Max: {record.fields.Maximo || 0}</span>
              <span>Total: {record.fields['Total Pines'] || 0}</span>
            </div>
            
            {/* Indicador de click */}
            <div className="text-center mt-2">
              <p className="text-xs text-bowling-orange-500 opacity-75">👆 Haz clic para ver ficha completa</p>
            </div>
          </div>
        ))}
        
        {/* Mensaje cuando no hay resultados */}
        {sortedData.length === 0 && searchFilter && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron jugadores con el nombre "{searchFilter}"</p>
            <button
              onClick={() => setSearchFilter('')}
              className="mt-2 text-bowling-orange-500 hover:text-bowling-orange-600 font-medium"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}
        
        {/* Mensaje cuando no hay datos */}
        {data.length === 0 && !searchFilter && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay jugadores disponibles</p>
          </div>
        )}
        
        {/* Contador de registros mostrados */}
        {sortedData.length > 24 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 24 de {sortedData.length} jugadores
              {searchFilter && ` (filtrados de ${data.length} totales)`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ordenado por: {sortBy === 'PromedioHDC' ? 'Promedio HDC' : sortBy === 'Total Pines' ? 'Total Pines' : sortBy} ({sortOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'})
            </p>
          </div>
        )}
        
        {/* Información de ordenamiento cuando hay 24 o menos */}
        {sortedData.length <= 24 && sortedData.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Mostrando {sortedData.length} jugadores - Ordenado por: {sortBy === 'PromedioHDC' ? 'Promedio HDC' : sortBy === 'Total Pines' ? 'Total Pines' : sortBy} ({sortOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'})
            </p>
          </div>
        )}
      </div>
    )
  }

  // Renderizado específico para Información
  const renderInformacion = () => (
    <div className="space-y-4">
      {data.map((record, index) => (
        <div key={record.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-bowling-black-900 mb-1">
                  {record.fields.Name || `Información ${index + 1}`}
                </h3>
                <p className="text-sm text-purple-600 font-medium">
                  📋 Torneo Relámpago
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                #{index + 1}
              </span>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {record.fields.Notes || 'Sin información disponible'}
            </p>
          </div>
          
          {record.fields['Patron Aceite'] && record.fields['Patron Aceite'].length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-600 font-medium text-sm flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Patrón de Aceite (PDF):
                </span>
              </div>
              <div className="space-y-2">
                {record.fields['Patron Aceite'].map((attachment: any, attachIndex: number) => (
                  <a
                    key={attachIndex}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 bg-white rounded border hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-red-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attachment.filename || 'Patrón de Aceite.pdf'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'PDF'}
                        </p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  // Renderizado específico para Gráficos Jugadores
  const renderGraficosJugadores = () => {
    // Filtrar y preparar datos para gráficos
    const playersData = data
      .filter(record => record.fields.Name && record.fields.Promedio)
      .map(record => ({
        name: record.fields.Name,
        promedio: parseFloat(record.fields.Promedio) || 0,
        promedioHDC: parseFloat(record.fields.PromedioHDC) || 0,
        handicap: parseFloat(record.fields.hdc) || 0,
        diferencia: (parseFloat(record.fields.Promedio) || 0) - (parseFloat(record.fields.PromedioHDC) || 0)
      }))
      .sort((a, b) => {
        let valueA, valueB
        switch (graphicsSortBy) {
          case 'PromedioHDC':
            valueA = a.promedioHDC
            valueB = b.promedioHDC
            break
          case 'Promedio':
            valueA = a.promedio
            valueB = b.promedio
            break
          case 'Name':
            valueA = a.name.toLowerCase()
            valueB = b.name.toLowerCase()
            break
          case 'diferencia':
            valueA = a.diferencia
            valueB = b.diferencia
            break
          default:
            valueA = a.promedioHDC
            valueB = b.promedioHDC
        }
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return graphicsSortOrder === 'desc' ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
        }
        
        return graphicsSortOrder === 'desc' ? valueB - valueA : valueA - valueB
      })
      .slice(0, 24) // Top 24 jugadores

    const maxPromedio = Math.max(...playersData.map(p => Math.max(p.promedio, p.promedioHDC)))

    return (
      <div className="space-y-6">
        {/* Header de Gráficos */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
          <div className="flex items-center">
            <PieChart className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">Gráficos de Promedios</h2>
              <p className="text-white text-opacity-90">Comparación visual de promedios con y sin handicap</p>
            </div>
          </div>
        </div>

        {/* Filtros de ordenamiento para gráficos */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por:</label>
              <select
                value={graphicsSortBy}
                onChange={(e) => setGraphicsSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="PromedioHDC">Promedio HDC</option>
                <option value="Promedio">Promedio Regular</option>
                <option value="Name">Nombre</option>
                <option value="diferencia">Diferencia (Impacto Handicap)</option>
              </select>
            </div>
            
            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden:</label>
              <select
                value={graphicsSortOrder}
                onChange={(e) => setGraphicsSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="desc">Mayor a menor</option>
                <option value="asc">Menor a mayor</option>
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Mostrando 24 jugadores ordenados por: {graphicsSortBy === 'PromedioHDC' ? 'Promedio HDC' : graphicsSortBy === 'diferencia' ? 'Diferencia' : graphicsSortBy} ({graphicsSortOrder === 'desc' ? 'Mayor a menor' : 'Menor a mayor'})
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {playersData.length > 0 ? Math.round(playersData.reduce((sum, p) => sum + p.promedio, 0) / playersData.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Promedio General</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {playersData.length > 0 ? Math.round(playersData.reduce((sum, p) => sum + p.promedioHDC, 0) / playersData.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Promedio HDC General</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {playersData.length > 0 ? Math.round(playersData.reduce((sum, p) => sum + p.diferencia, 0) / playersData.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Diferencia Promedio</div>
          </div>
        </div>

        {/* Gráfico de Barras Comparativo */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
            Top 24 Jugadores - Comparación de Promedios
          </h3>
          
          <div className="space-y-4">
            {playersData.map((player, index) => (
              <div key={player.name} className="space-y-2">
                {/* Nombre del jugador */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">{player.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    HDC: {player.handicap}
                  </div>
                </div>
                
                {/* Barras de promedio */}
                <div className="space-y-1">
                  {/* Promedio regular */}
                  <div className="flex items-center">
                    <div className="w-20 text-xs text-gray-600 mr-2">Promedio:</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(player.promedio / maxPromedio) * 100}%` }}
                      >
                        <span className="text-xs text-white font-bold">{player.promedio}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Promedio HDC */}
                  <div className="flex items-center">
                    <div className="w-20 text-xs text-gray-600 mr-2">HDC:</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(player.promedioHDC / maxPromedio) * 100}%` }}
                      >
                        <span className="text-xs text-white font-bold">{player.promedioHDC}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Diferencia */}
                  <div className="flex items-center justify-end">
                    <div className="text-xs text-gray-500">
                      Diferencia: 
                      <span className={`font-bold ml-1 ${
                        player.diferencia >= 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {player.diferencia > 0 ? '+' : ''}{player.diferencia.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Leyenda */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded mr-2"></div>
                <span className="text-gray-600">Promedio Regular</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded mr-2"></div>
                <span className="text-gray-600">Promedio con Handicap</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              * Diferencia positiva indica que el handicap reduce el promedio
            </p>
          </div>
        </div>
        
        {/* Análisis de Handicaps */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Análisis de Handicaps
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jugadores con mayor diferencia */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Mayor Impacto del Handicap</h4>
              <div className="space-y-2">
                {playersData
                  .sort((a, b) => b.diferencia - a.diferencia)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.name} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-sm text-red-600 font-bold">-{player.diferencia.toFixed(1)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Jugadores con menor diferencia */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Menor Impacto del Handicap</h4>
              <div className="space-y-2">
                {playersData
                  .sort((a, b) => a.diferencia - b.diferencia)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.name} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">{player.name}</span>
                      <span className="text-sm text-green-600 font-bold">{player.diferencia.toFixed(1)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizado específico para Datos Finales
  const renderDatosFinales = () => {
    // Procesar datos para estadísticas (usando los mismos nombres de campos que FinalDataSection)
    const playersData = data.map(record => ({
      id: record.id,
      jugador: record.fields.jugador || '',
      equipo: record.fields.equipo || '',
      total_games_historico: record.fields.total_games_historico || 0,
      score_minimo: record.fields.score_minimo || 0,
      score_maximo: record.fields.score_maximo || 0,
      promedio_historico: record.fields.promedio_historico || 0,
      foto: record.fields.foto || []
    }))

    // Estadísticas generales
    const totalPlayers = playersData.length
    const totalGames = playersData.reduce((sum, player) => sum + player.total_games_historico, 0)
    const highestScore = playersData.length > 0 ? Math.max(...playersData.map(player => player.score_maximo)) : 0
    const averageScore = playersData.length > 0 
      ? Math.round(playersData.reduce((sum, player) => sum + player.score_maximo, 0) / playersData.length)
      : 0

    return (
      <div className="space-y-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <div className="text-sm opacity-90">Total Jugadores</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{totalGames}</div>
            <div className="text-sm opacity-90">Juegos Totales</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{highestScore}</div>
            <div className="text-sm opacity-90">Score Máximo</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{averageScore}</div>
            <div className="text-sm opacity-90">Promedio General</div>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Foto</th>
                  <th className="px-4 py-3 text-left">Jugador</th>
                  <th className="px-4 py-3 text-center">Equipo</th>
                  <th className="px-4 py-3 text-center">Juegos</th>
                  <th className="px-4 py-3 text-center">Score Min</th>
                  <th className="px-4 py-3 text-center">Score Max</th>
                  <th className="px-4 py-3 text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {playersData.slice(0, 20).map((player, index) => (
                  <tr key={player.id} className={`border-b hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}>
                    <td className="px-4 py-3">
                      {player.foto && player.foto.length > 0 ? (
                        <img
                          src={player.foto[0].url}
                          alt={player.jugador}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bowling-blue-400 to-bowling-orange-400 flex items-center justify-center text-white font-bold text-sm">
                          {player.jugador.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{player.jugador}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-bowling-blue-100 text-bowling-blue-800">
                        {player.equipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold">{player.total_games_historico}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-red-600">{player.score_minimo}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-green-600">{player.score_maximo}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-blue-600">{player.promedio_historico}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {playersData.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay datos finales disponibles</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${tableConfig.color} p-6`}>
        <h3 className="text-2xl font-bold text-white flex items-center">
          <IconComponent className="w-6 h-6 mr-2" />
          {tableConfig.name}
        </h3>
        <p className="text-white/80 mt-2">{tableConfig.description}</p>
        <p className="text-white/60 text-sm mt-1">
          {tableName === 'Lista Jugadores' && searchFilter ? 
            `${filteredData.length} de ${data.length} registros` : 
            `${data.length} registros encontrados`
          }
        </p>
      </div>
      
      <div className="p-6">
        {/* Campo de búsqueda solo para Lista Jugadores */}
        {tableName === 'Lista Jugadores' && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar jugador por nombre..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent transition-colors"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {searchFilter && (
              <p className="text-sm text-gray-600 mt-2">
                Mostrando {filteredData.length} de {data.length} jugadores
              </p>
            )}
          </div>
        )}
        
        {data.length > 0 ? (
          tableName === 'Lista Jugadores' ? renderListaJugadores() : 
          tableName === 'Jugador' ? renderJugador() : 
          tableName === 'Graficos Jugadores' ? renderGraficosJugadores() : 
          tableName === 'Informacion' ? renderInformacion() : 
          tableName === 'Datos Finales' ? renderDatosFinales() : 
          renderListaJugadores()
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
        )}
        
        {(tableName === 'Lista Jugadores' ? filteredData.length : data.length) > 20 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 20 de {tableName === 'Lista Jugadores' ? filteredData.length : data.length} registros
              {tableName === 'Lista Jugadores' && searchFilter && ` (filtrados de ${data.length} totales)`}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Ficha Completa del Jugador */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPlayer.fields.Name || 'Sin nombre'}</h2>
                    <p className="text-white text-opacity-90">Ficha Completa del Jugador</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Target className="w-5 h-5 text-bowling-orange-500 mr-2" />
                    <h3 className="text-lg font-semibold text-bowling-black-900">Información General</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Handicap:</span>
                      <span className="font-semibold">{selectedPlayer.fields.hdc || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pista:</span>
                      <span className="font-semibold">{selectedPlayer.fields.Pista || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ranking:</span>
                      <span className="font-semibold">{selectedPlayer.fields.Rank || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-5 h-5 text-bowling-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-bowling-black-900">Promedios</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Promedio HDC:</span>
                      <span className="font-bold text-bowling-blue-500 text-xl">{selectedPlayer.fields.PromedioHDC ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Promedio:</span>
                      <span className="font-semibold text-bowling-orange-500 text-lg">{selectedPlayer.fields.Promedio || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Líneas de Juego */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-bowling-black-900 mb-3">Líneas de Juego</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {['L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map((linea) => (
                    <div key={linea} className="bg-white border-2 border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{linea}</p>
                      <p className="text-xl font-bold text-bowling-black-900">
                        {selectedPlayer.fields[linea] || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estadísticas Detalladas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-bowling-black-900 mb-3">Estadísticas Detalladas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Mínimo</p>
                    <p className="text-2xl font-bold text-red-500">{selectedPlayer.fields.Minimo || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Máximo</p>
                    <p className="text-2xl font-bold text-green-500">{selectedPlayer.fields.Maximo || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Total Pines</p>
                    <p className="text-2xl font-bold text-bowling-blue-500">{selectedPlayer.fields['Total Pines'] || 0}</p>
                  </div>
                </div>
              </div>

              {/* Botón de Cerrar */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function StatsMenu() {
  const [selectedTable, setSelectedTable] = useState<string>('Lista Jugadores')
  const selectedConfig = AVAILABLE_TABLES.find(table => table.id === selectedTable) || AVAILABLE_TABLES[0]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - Responsive */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bowling-black-900 mb-2 sm:mb-4">Torneo Relámpago</h1>
        <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-2 sm:mb-4"></div>
        <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Explora las diferentes tablas de datos de nuestro torneo relámpago
        </p>
      </div>

      {/* Table Selection Menu - Responsive Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-6">
        {AVAILABLE_TABLES.map((table) => {
          const IconComponent = table.icon
          const isSelected = selectedTable === table.id
          
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg border-2 transition-all text-left w-full ${
                isSelected
                  ? 'border-bowling-orange-500 bg-bowling-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-bowling-blue-300 hover:shadow-sm'
              }`}
            >
              {/* Icon - Smaller on mobile */}
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r ${table.color} flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}>
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-xs sm:text-sm font-bold truncate ${
                  isSelected ? 'text-bowling-orange-600' : 'text-bowling-black-900'
                }`}>
                  {table.name}
                </h3>
                {/* Description - Hidden on mobile, truncated on tablet+ */}
                <p className="text-xs text-gray-500 hidden sm:block truncate">
                  {table.description.length > 35 ? table.description.substring(0, 35) + '...' : table.description}
                </p>
              </div>
              
              {/* Arrow - Smaller on mobile */}
              <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform flex-shrink-0 ${
                isSelected ? 'text-bowling-orange-500 rotate-90' : 'text-gray-400'
              }`} />
            </button>
          )
        })}
      </div>

      {/* Selected Table View */}
      <TableView tableName={selectedTable} tableConfig={selectedConfig} />
    </div>
  )
}
