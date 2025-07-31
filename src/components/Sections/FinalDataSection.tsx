import React, { useState, useMemo } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { AnalysisSection } from './AnalysisSection'
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  ChevronLeft, 
  ChevronRight, 
  X,
  User,
  Users,
  Trophy,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  FileText,
  Database,
  Filter
} from 'lucide-react'

// Opciones del menú de estadísticas
const STATS_MENU_OPTIONS = [
  { id: 'datos-finales', name: 'Datos Finales', icon: Database, description: 'Estadísticas completas de jugadores' },
  { id: 'analisis-pdfs', name: 'Análisis de PDFs', icon: FileText, description: 'Documentos y análisis de torneos' }
]

interface PlayerData {
  id: string
  jugador: string
  equipo: string
  total_games_historico: number
  games_analizados: number
  fecha_inicio_analisis: string
  fecha_fin_analisis: string
  promedio_historico: number
  promedio_ultimos_50: number
  diferencia_vs_historico: number
  promedio_inicio: number
  promedio_medio: number
  promedio_final: number
  cambio_absoluto: number
  cambio_porcentual: number
  desviacion_std: number
  coef_variacion: number
  tendencia_slope: number
  slope_categoria: string
  patron: string
  promedio_representativo: number
  periodo_recomendado: string
  diferencia_rep_real: number
  score_minimo: number
  score_maximo: number
  rango_scores: number
  SEXO: string
  activos: number
  foto?: Array<{
    id: string
    url: string
    filename: string
  }>
}

export function FinalDataSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [sortBy, setSortBy] = useState<keyof PlayerData>('score_maximo')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null)
  const [selectedOption, setSelectedOption] = useState('datos-finales')

  const { data, loading, error } = useAirtable('Datos Finales', {
    sort: [{ field: sortBy, direction: sortOrder }]
  })

  // Procesar datos
  const playersData: PlayerData[] = data.map(record => ({
    id: record.id,
    jugador: record.fields.jugador || '',
    equipo: record.fields.equipo || '',
    total_games_historico: record.fields.total_games_historico || 0,
    games_analizados: record.fields.games_analizados || 0,
    fecha_inicio_analisis: record.fields.fecha_inicio_analisis || '',
    fecha_fin_analisis: record.fields.fecha_fin_analisis || '',
    promedio_historico: record.fields.promedio_historico || 0,
    promedio_ultimos_50: record.fields.promedio_ultimos_50 || 0,
    diferencia_vs_historico: record.fields.diferencia_vs_historico || 0,
    promedio_inicio: record.fields.promedio_inicio || 0,
    promedio_medio: record.fields.promedio_medio || 0,
    promedio_final: record.fields.promedio_final || 0,
    cambio_absoluto: record.fields.cambio_absoluto || 0,
    cambio_porcentual: record.fields.cambio_porcentual || 0,
    desviacion_std: record.fields.desviacion_std || 0,
    coef_variacion: record.fields.coef_variacion || 0,
    tendencia_slope: record.fields.tendencia_slope || 0,
    slope_categoria: record.fields.slope_categoria || '',
    patron: record.fields.patron || '',
    promedio_representativo: record.fields.promedio_representativo || 0,
    periodo_recomendado: record.fields.periodo_recomendado || '',
    diferencia_rep_real: record.fields.diferencia_rep_real || 0,
    score_minimo: record.fields.score_minimo || 0,
    score_maximo: record.fields.score_maximo || 0,
    rango_scores: record.fields.rango_scores || 0,
    SEXO: record.fields.SEXO || '',
    activos: record.fields.activos || 0,
    foto: record.fields.foto || []
  }))

  // Filtrar datos
  const filteredPlayers = playersData.filter(player => {
    const matchesSearch = player.jugador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.equipo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = selectedTeam === '' || player.equipo === selectedTeam
    return matchesSearch && matchesTeam
  })

  // Obtener equipos únicos para el filtro
  const uniqueTeams = [...new Set(playersData.map(player => player.equipo))].filter(Boolean)

  // Estadísticas generales
  const totalPlayers = playersData.length
  const totalGames = playersData.reduce((sum, player) => sum + player.total_games_historico, 0)
  const highestScore = Math.max(...playersData.map(player => player.score_maximo))
  const averageScore = playersData.length > 0 
    ? Math.round(playersData.reduce((sum, player) => sum + player.score_maximo, 0) / playersData.length)
    : 0
  const globalAverage = playersData.length > 0
    ? Math.round(playersData.reduce((sum, player) => sum + player.promedio_historico, 0) / playersData.length)
    : 0

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bowling-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos finales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white px-6 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Si se selecciona análisis de PDFs, mostrar ese componente
  if (selectedOption === 'analisis-pdfs') {
    return <AnalysisSection />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-bowling-black-900 mb-2">Estadísticas</h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-2 sm:mb-4"></div>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Selecciona el tipo de estadísticas que deseas consultar
          </p>
        </div>

        {/* Menú de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {STATS_MENU_OPTIONS.map((option) => {
            const IconComponent = option.icon
            return (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                  selectedOption === option.id ? 'ring-2 ring-bowling-orange-500 bg-bowling-orange-50' : ''
                }`}
              >
                <div className="text-center">
                  <IconComponent className="w-12 h-12 mx-auto mb-4 text-bowling-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{option.name}</h3>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="w-8 h-8 text-bowling-orange-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">{filteredPlayers.length}</div>
            <div className="text-gray-600">Jugadores</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Trophy className="w-8 h-8 text-bowling-orange-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">{totalGames}</div>
            <div className="text-gray-600">Juegos Totales</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">{highestScore}</div>
            <div className="text-gray-600">Puntaje Máximo</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-800">{globalAverage}</div>
            <div className="text-gray-600">Promedio Histórico</div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar jugador o equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por equipo */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todos los equipos</option>
                {uniqueTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('score_maximo')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'score_maximo' 
                    ? 'bg-bowling-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Max Score
              </button>
              <button
                onClick={() => handleSort('total_games_historico')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'total_games_historico' 
                    ? 'bg-bowling-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Juegos
              </button>
              <button
                onClick={() => handleSort('promedio_historico')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'promedio_historico' 
                    ? 'bg-bowling-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Promedio
              </button>
            </div>
          </div>
        </div>

        {/* Vista Desktop - Tabla */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-bowling-blue-600 to-bowling-orange-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleSort('jugador')}>
                    Jugador
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleSort('equipo')}>
                    Equipo
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleSort('total_games_historico')}>
                    Juegos
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleSort('promedio_historico')}>
                    Promedio
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleSort('score_maximo')}>
                    Score Máximo
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleSort('slope_categoria')}>
                    Tendencia
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr 
                    key={player.id} 
                    className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    {/* Jugador */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {player.foto && player.foto.length > 0 ? (
                          <img
                            src={player.foto[0].url}
                            alt={player.jugador}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bowling-blue-400 to-bowling-orange-400 flex items-center justify-center text-white font-bold mr-3">
                            {player.jugador.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-800">{player.jugador}</div>
                          <div className="text-sm text-gray-500">
                            {player.SEXO && (
                              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                player.SEXO === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                              }`}></span>
                            )}
                            {player.SEXO === 'M' ? 'Masculino' : player.SEXO === 'F' ? 'Femenino' : 'No especificado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Equipo */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-bowling-blue-100 text-bowling-blue-800">
                        {player.equipo}
                      </span>
                    </td>
                    
                    {/* Juegos */}
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-lg">{player.total_games_historico}</div>
                      <div className="text-xs text-gray-500">{player.games_analizados} analizados</div>
                    </td>
                    
                    {/* Promedio */}
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-blue-600 text-lg">{player.promedio_historico.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Representativo: {player.promedio_representativo.toFixed(1)}</div>
                    </td>
                    
                    {/* Score Máximo */}
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-green-600 text-lg">{player.score_maximo}</div>
                      <div className="text-xs text-gray-500">Min: {player.score_minimo}</div>
                    </td>
                    
                    {/* Tendencia */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        player.slope_categoria === 'Mejorando' ? 'bg-green-100 text-green-800' :
                        player.slope_categoria === 'Empeorando' ? 'bg-red-100 text-red-800' :
                        player.slope_categoria === 'Estable' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {player.slope_categoria || 'N/A'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {player.cambio_porcentual > 0 ? '+' : ''}{player.cambio_porcentual.toFixed(1)}%
                      </div>
                    </td>
                    
                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlayer(player)
                        }}
                        className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista Móvil - Cards */}
        <div className="md:hidden space-y-4">
          {filteredPlayers.map((player, index) => (
            <div 
              key={player.id}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedPlayer(player)}
            >
              {/* Header del Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {player.foto && player.foto.length > 0 ? (
                    <img
                      src={player.foto[0].url}
                      alt={player.jugador}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bowling-blue-400 to-bowling-orange-400 flex items-center justify-center text-white font-bold mr-3">
                      {player.jugador.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{player.jugador}</h3>
                    <p className="text-sm text-gray-500">
                      {player.SEXO && (
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          player.SEXO === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                        }`}></span>
                      )}
                      {player.SEXO === 'M' ? 'Masculino' : player.SEXO === 'F' ? 'Femenino' : 'No especificado'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPlayer(player)
                  }}
                  className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                >
                  Detalles
                </button>
              </div>

              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{player.promedio_historico.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{player.score_maximo}</div>
                  <div className="text-xs text-gray-500">Score Máximo</div>
                </div>
              </div>

              {/* Información Secundaria */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Equipo</div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-bowling-blue-100 text-bowling-blue-800">
                    {player.equipo}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Juegos</div>
                  <div className="font-semibold">{player.total_games_historico}</div>
                  <div className="text-xs text-gray-500">{player.games_analizados} analizados</div>
                </div>
              </div>

              {/* Tendencia */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Tendencia</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    player.slope_categoria === 'Mejorando' ? 'bg-green-100 text-green-800' :
                    player.slope_categoria === 'Empeorando' ? 'bg-red-100 text-red-800' :
                    player.slope_categoria === 'Estable' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {player.slope_categoria || 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Cambio</div>
                  <div className={`font-medium ${
                    player.cambio_porcentual > 0 ? 'text-green-600' : 
                    player.cambio_porcentual < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {player.cambio_porcentual > 0 ? '+' : ''}{player.cambio_porcentual.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 text-center text-gray-600">
          <p>Mostrando {filteredPlayers.length} de {totalPlayers} jugadores</p>
        </div>
      </div>

      {/* Modal de Detalles del Jugador */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-bowling-blue-600 to-bowling-orange-500 text-white p-4 md:p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedPlayer.foto && selectedPlayer.foto.length > 0 ? (
                    <img
                      src={selectedPlayer.foto[0].url}
                      alt={selectedPlayer.jugador}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-4 border-white mr-3 md:mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg md:text-xl mr-3 md:mr-4">
                      {selectedPlayer.jugador.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{selectedPlayer.jugador}</h2>
                    <p className="text-white/80 text-sm md:text-base">{selectedPlayer.equipo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-4 md:p-6">
              {/* Información General */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm md:text-base">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sexo:</span>
                      <span className={`font-medium ${
                        selectedPlayer.SEXO === 'M' ? 'text-blue-600' : 
                        selectedPlayer.SEXO === 'F' ? 'text-pink-600' : 'text-gray-600'
                      }`}>
                        {selectedPlayer.SEXO === 'M' ? 'Masculino' : selectedPlayer.SEXO === 'F' ? 'Femenino' : 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patrón:</span>
                      <span className="font-medium text-purple-600">{selectedPlayer.patron || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Juegos y Análisis</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Juegos:</span>
                      <span className="font-bold text-lg">{selectedPlayer.total_games_historico}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Analizados:</span>
                      <span className="font-medium">{selectedPlayer.games_analizados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inicio Análisis:</span>
                      <span className="text-xs">
                        {selectedPlayer.fecha_inicio_analisis ? 
                          new Date(selectedPlayer.fecha_inicio_analisis).toLocaleDateString('es-ES') : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fin Análisis:</span>
                      <span className="text-xs">
                        {selectedPlayer.fecha_fin_analisis ? 
                          new Date(selectedPlayer.fecha_fin_analisis).toLocaleDateString('es-ES') : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-700 mb-2">Scores</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Máximo:</span>
                      <span className="font-bold text-green-600 text-lg">{selectedPlayer.score_maximo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mínimo:</span>
                      <span className="font-bold text-red-600">{selectedPlayer.score_minimo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rango:</span>
                      <span className="font-medium">{selectedPlayer.rango_scores}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promedios */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Promedios y Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedPlayer.promedio_historico.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Promedio Histórico</div>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedPlayer.promedio_representativo.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Representativo</div>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedPlayer.promedio_ultimos_50.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Últimos 50</div>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${
                      selectedPlayer.diferencia_vs_historico > 0 ? 'text-green-600' : 
                      selectedPlayer.diferencia_vs_historico < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {selectedPlayer.diferencia_vs_historico > 0 ? '+' : ''}{selectedPlayer.diferencia_vs_historico.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Dif. vs Histórico</div>
                  </div>
                </div>
              </div>

              {/* Evolución por Períodos */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolución por Períodos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-yellow-600">{selectedPlayer.promedio_inicio.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Promedio Inicio</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-blue-600">{selectedPlayer.promedio_medio.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Promedio Medio</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-green-600">{selectedPlayer.promedio_final.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Promedio Final</div>
                  </div>
                </div>
              </div>

              {/* Análisis de Tendencia */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Tendencia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Categoría de Tendencia:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedPlayer.slope_categoria === 'Mejorando' ? 'bg-green-100 text-green-800' :
                          selectedPlayer.slope_categoria === 'Empeorando' ? 'bg-red-100 text-red-800' :
                          selectedPlayer.slope_categoria === 'Estable' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedPlayer.slope_categoria || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Slope Tendencia:</span>
                        <span className={`font-medium ${
                          selectedPlayer.tendencia_slope > 0 ? 'text-green-600' : 
                          selectedPlayer.tendencia_slope < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedPlayer.tendencia_slope.toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Período Recomendado:</span>
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-medium">
                          {selectedPlayer.periodo_recomendado || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Cambio Absoluto:</span>
                        <span className={`font-bold ${
                          selectedPlayer.cambio_absoluto > 0 ? 'text-green-600' : 
                          selectedPlayer.cambio_absoluto < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedPlayer.cambio_absoluto > 0 ? '+' : ''}{selectedPlayer.cambio_absoluto.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Cambio Porcentual:</span>
                        <span className={`font-bold ${
                          selectedPlayer.cambio_porcentual > 0 ? 'text-green-600' : 
                          selectedPlayer.cambio_porcentual < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedPlayer.cambio_porcentual > 0 ? '+' : ''}{selectedPlayer.cambio_porcentual.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dif. Rep vs Real:</span>
                        <span className={`font-medium ${
                          selectedPlayer.diferencia_rep_real > 0 ? 'text-green-600' : 
                          selectedPlayer.diferencia_rep_real < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedPlayer.diferencia_rep_real > 0 ? '+' : ''}{selectedPlayer.diferencia_rep_real.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas Avanzadas */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas Avanzadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Desviación Estándar:</span>
                      <span className="font-bold text-purple-600">{selectedPlayer.desviacion_std.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Coeficiente de Variación:</span>
                      <span className="font-bold text-indigo-600">{selectedPlayer.coef_variacion.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
