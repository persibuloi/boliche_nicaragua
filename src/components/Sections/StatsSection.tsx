import React, { useState } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { Trophy, Target, Users, TrendingUp, BarChart3, Award, Medal, Crown, Star } from 'lucide-react'

export function StatsSection() {
  const [selectedView, setSelectedView] = useState<'ranking' | 'equipos' | 'estadisticas'>('ranking')
  
  // Usar las tablas de ranking y posiciones de equipos
  const { data: rankingData, loading: rankingLoading, error: rankingError } = useAirtable('Ranking', {
    sort: [{ field: 'Ranking', direction: 'asc' }],
    maxRecords: 50
  })
  
  const { data: teamPositionsData, loading: teamPositionsLoading, error: teamPositionsError } = useAirtable('Posiciones App', {
    sort: [{ field: 'Posicion', direction: 'asc' }],
    maxRecords: 20
  })

  const isLoading = rankingLoading || teamPositionsLoading
  const hasError = rankingError || teamPositionsError

  // Procesar datos del ranking
  const getTopPlayers = () => {
    if (!rankingData.length) return []
    return rankingData
      .filter(record => record.fields.JUGADOR && record.fields.Puntos)
      .sort((a, b) => (a.fields.Ranking || 999) - (b.fields.Ranking || 999))
      .slice(0, 10)
  }

  const getTeamStats = () => {
    if (!teamPositionsData.length) return []
    return teamPositionsData
      .filter(record => record.fields.EQUIPO && record.fields.Posicion)
      .sort((a, b) => (a.fields.Posicion || 999) - (b.fields.Posicion || 999))
      .slice(0, 15)
  }

  const getTeamStatsFromRanking = () => {
    if (!rankingData.length) return []
    const teamStats = new Map()
    
    rankingData.forEach(record => {
      const team = record.fields.EQUIPO || 'Sin equipo'
      const points = record.fields.Puntos || 0
      const lines = record.fields.Lineas || 0
      
      if (!teamStats.has(team)) {
        teamStats.set(team, {
          name: team,
          totalPoints: 0,
          totalLines: 0,
          playerCount: 0,
          avgPoints: 0
        })
      }
      
      const stats = teamStats.get(team)
      stats.totalPoints += points
      stats.totalLines += lines
      stats.playerCount += 1
      stats.avgPoints = stats.totalPoints / stats.playerCount
    })
    
    return Array.from(teamStats.values())
      .sort((a, b) => b.avgPoints - a.avgPoints)
      .slice(0, 8)
  }

  const getGeneralStats = () => {
    const stats = {
      totalPlayers: rankingData.length,
      totalTeams: teamPositionsData.length,
      avgPoints: 0,
      topScore: 0,
      totalLines: 0,
      totalJornadas: 0,
      avgTeamPoints: 0
    }
    
    // Estadísticas de jugadores individuales
    if (rankingData.length > 0) {
      const totalPlayerPoints = rankingData.reduce((sum, r) => sum + (r.fields.Puntos || 0), 0)
      const totalPlayerLines = rankingData.reduce((sum, r) => sum + (r.fields.Lineas || 0), 0)
      const topPlayerScore = Math.max(...rankingData.map(r => r.fields.Puntos || 0))
      
      stats.avgPoints = Math.round(totalPlayerPoints / rankingData.length)
      stats.topScore = topPlayerScore
      stats.totalLines = totalPlayerLines
    }
    
    // Estadísticas de equipos
    if (teamPositionsData.length > 0) {
      const totalTeamPoints = teamPositionsData.reduce((sum, r) => sum + (r.fields.Puntos || 0), 0)
      const totalJornadas = teamPositionsData.reduce((sum, r) => sum + (r.fields['No jornadas'] || 0), 0)
      
      stats.avgTeamPoints = Math.round(totalTeamPoints / teamPositionsData.length)
      stats.totalJornadas = totalJornadas
    }
    
    return stats
  }

  const topPlayers = getTopPlayers()
  const teamStats = getTeamStats()
  const generalStats = getGeneralStats()

  return (
    <section className="py-20 bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Estadísticas y Ranking</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre el ranking oficial y estadísticas de nuestra liga de bowling
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setSelectedView('ranking')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                selectedView === 'ranking'
                  ? 'bg-bowling-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-bowling-orange-500'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Ranking
            </button>
            <button
              onClick={() => setSelectedView('equipos')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                selectedView === 'equipos'
                  ? 'bg-bowling-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-bowling-orange-500'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Equipos
            </button>
            <button
              onClick={() => setSelectedView('estadisticas')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                selectedView === 'estadisticas'
                  ? 'bg-bowling-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-bowling-orange-500'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Estadísticas
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500"></div>
          </div>
        ) : hasError ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Error al cargar las estadísticas: {hasError}</p>
            <p className="text-sm text-gray-500 mt-2">Verifica que la tabla 'Ranking' exista en Airtable</p>
          </div>
        ) : (
          <div>
            {/* Ranking View */}
            {selectedView === 'ranking' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Crown className="w-6 h-6 mr-2" />
                    Ranking Oficial de Jugadores
                  </h3>
                  <p className="text-white/80 mt-2">Clasificación basada en puntos acumulados</p>
                </div>
                <div className="p-6">
                  {topPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {topPlayers.map((player, index) => (
                        <div key={player.id} className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-bowling-blue-500'
                            }`}>
                              {index < 3 ? (
                                index === 0 ? <Crown className="w-5 h-5" /> :
                                index === 1 ? <Medal className="w-5 h-5" /> :
                                <Star className="w-5 h-5" />
                              ) : (
                                player.fields.Ranking || index + 1
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-bowling-black-900 text-lg">
                                {player.fields.JUGADOR || 'Sin nombre'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {player.fields.EQUIPO || 'Sin equipo'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-bowling-orange-500">
                              {player.fields.Puntos || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                              {player.fields.Lineas || 0} líneas
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay datos de ranking disponibles</p>
                  )}
                </div>
              </div>
            )}

            {/* Teams View */}
            {selectedView === 'equipos' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-bowling-blue-500 to-bowling-orange-500 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Trophy className="w-6 h-6 mr-2" />
                    Tabla de Posiciones Oficial
                  </h3>
                  <p className="text-white/80 mt-2">Clasificación oficial de equipos por temporada</p>
                </div>
                <div className="p-6">
                  {teamStats.length > 0 ? (
                    <div className="space-y-3">
                      {teamStats.map((team, index) => (
                        <div key={team.id} className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-bowling-blue-500'
                            }`}>
                              {index < 3 ? (
                                index === 0 ? <Crown className="w-6 h-6" /> :
                                index === 1 ? <Medal className="w-6 h-6" /> :
                                <Star className="w-6 h-6" />
                              ) : (
                                team.fields.Posicion || index + 1
                              )}
                            </div>
                            {/* Logo del equipo si existe */}
                            {team.fields.Logo && (
                              <div className="w-10 h-10 mr-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                <img 
                                  src={Array.isArray(team.fields.Logo) ? team.fields.Logo[0]?.url : team.fields.Logo} 
                                  alt={`Logo ${team.fields.EQUIPO}`}
                                  className="w-8 h-8 object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-bowling-black-900 text-lg">
                                {team.fields.EQUIPO || 'Sin nombre'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {team.fields['No jornadas'] || 0} jornadas jugadas
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-bowling-orange-500">
                              {team.fields.Puntos || 0}
                            </p>
                            <p className="text-sm text-gray-600">
                              Promedio: {team.fields.Promedio || 0}
                            </p>
                            <p className="text-xs text-gray-500">
                              {team.fields.Lineas || 0} líneas
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay datos de posiciones disponibles</p>
                  )}
                </div>
              </div>
            )}

            {/* Statistics View */}
            {selectedView === 'estadisticas' && (
              <div>
                {/* Estadísticas Principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-bowling-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.totalPlayers}</p>
                    <p className="text-sm text-gray-600">Jugadores Activos</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.totalTeams}</p>
                    <p className="text-sm text-gray-600">Equipos Registrados</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.avgPoints}</p>
                    <p className="text-sm text-gray-600">Promedio Jugadores</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-bowling-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.topScore}</p>
                    <p className="text-sm text-gray-600">Mejor Puntaje Individual</p>
                  </div>
                </div>

                {/* Estadísticas Adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-bowling-blue-500 to-bowling-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.totalLines}</p>
                    <p className="text-sm text-gray-600">Total Líneas Jugadas</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.avgTeamPoints}</p>
                    <p className="text-sm text-gray-600">Promedio por Equipo</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-bowling-black-900">{generalStats.totalJornadas}</p>
                    <p className="text-sm text-gray-600">Total Jornadas</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}