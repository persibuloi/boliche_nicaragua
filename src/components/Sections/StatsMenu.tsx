import React, { useState } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { 
  Users, 
  Trophy, 
  BarChart3,
  ChevronRight,
  Info,
  FileText,
  Download,
  Search,
  X
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
    name: 'Jugador', 
    icon: Trophy, 
    description: 'Información detallada de jugadores con handicap y estadísticas',
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'Informacion', 
    name: 'Información', 
    icon: Info, 
    description: 'Información dinámica y anuncios sobre los torneos relámpago',
    color: 'from-purple-500 to-purple-600'
  }
]

interface TableViewProps {
  tableName: string
  tableConfig: typeof AVAILABLE_TABLES[0]
}

function TableView({ tableName, tableConfig }: TableViewProps) {
  const { data, loading, error } = useAirtable(tableName, {
    maxRecords: 100
  })
  const [searchFilter, setSearchFilter] = useState('')

  const IconComponent = tableConfig.icon

  // Filtrar datos basado en la búsqueda
  const filteredData = data.filter(record => {
    if (!searchFilter.trim()) return true
    const searchTerm = searchFilter.toLowerCase()
    const playerName = (record.fields.Jugador || record.fields.Name || '').toLowerCase()
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
  const renderJugador = () => (
    <div className="space-y-3">
      {data.slice(0, 20).map((record, index) => (
        <div key={record.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {record.fields.Rank || index + 1}
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
              <p className="text-lg font-bold text-bowling-orange-500">
                {record.fields.Promedio || 0}
              </p>
              <p className="text-xs text-gray-500">
                Prom HDC: {record.fields.PromedioHDC || 0}
              </p>
            </div>
          </div>
          
          {/* Líneas de juego */}
          <div className="grid grid-cols-4 gap-2 mb-2">
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
          </div>
          
          {/* Estadísticas adicionales */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Min: {record.fields.Minimo || 0}</span>
            <span>Max: {record.fields.Maximo || 0}</span>
            <span>Total: {record.fields['Total Pines'] || 0}</span>
          </div>
        </div>
      ))}
    </div>
  )

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
          tableName === 'Informacion' ? renderInformacion() : 
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
    </div>
  )
}

export function StatsMenu() {
  const [selectedTable, setSelectedTable] = useState<string>('Lista Jugadores')
  const selectedConfig = AVAILABLE_TABLES.find(table => table.id === selectedTable) || AVAILABLE_TABLES[0]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-bowling-black-900 mb-4">Torneo Relámpago</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explora las diferentes tablas de datos de nuestro torneo relámpago
        </p>
      </div>

      {/* Table Selection Menu */}
      <div className="flex flex-wrap gap-3 mb-6">
        {AVAILABLE_TABLES.map((table) => {
          const IconComponent = table.icon
          const isSelected = selectedTable === table.id
          
          return (
            <button
              key={table.id}
              onClick={() => setSelectedTable(table.id)}
              className={`flex items-center px-4 py-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-bowling-orange-500 bg-bowling-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-bowling-blue-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${table.color} flex items-center justify-center mr-3`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              
              <div className="text-left">
                <h3 className={`text-sm font-bold ${
                  isSelected ? 'text-bowling-orange-600' : 'text-bowling-black-900'
                }`}>
                  {table.name}
                </h3>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {table.description.length > 40 ? table.description.substring(0, 40) + '...' : table.description}
                </p>
              </div>
              
              <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${
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
