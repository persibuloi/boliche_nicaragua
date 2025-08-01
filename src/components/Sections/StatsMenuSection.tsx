import React, { useState } from 'react'
import { FinalDataSection } from './FinalDataSection'
import { AnalysisSection } from './AnalysisSection'
import { BracketTournamentSection } from './BracketTournamentSection'
import { Database, FileText, Trophy } from 'lucide-react'

// Opciones del menú de estadísticas
const STATS_MENU_OPTIONS = [
  { id: 'datos-finales', name: 'Datos Finales', icon: Database, description: 'Estadísticas completas de jugadores' },
  { id: 'analisis-pdfs', name: 'Análisis de PDFs', icon: FileText, description: 'Documentos y análisis de torneos' },
  { id: 'torneo-brackets', name: 'Torneo por Eliminación', icon: Trophy, description: 'Sistema de eliminación por brackets (8 jugadores, 4 líneas)' }
]

export function StatsMenuSection() {
  const [selectedOption, setSelectedOption] = useState('datos-finales')

  // Renderizar el componente seleccionado
  if (selectedOption === 'analisis-pdfs') {
    return <AnalysisSection />
  }

  if (selectedOption === 'datos-finales') {
    return <FinalDataSection />
  }

  if (selectedOption === 'torneo-brackets') {
    return <BracketTournamentSection />
  }

  // Menú principal de estadísticas
  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bowling-black-900 mb-2 sm:mb-4">Estadísticas</h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-2 sm:mb-4"></div>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Selecciona el tipo de estadísticas que deseas consultar
          </p>
        </div>

        {/* Menú de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {STATS_MENU_OPTIONS.map((option) => {
            const IconComponent = option.icon
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className="p-6 sm:p-8 rounded-xl border-2 border-gray-200 bg-white hover:border-bowling-blue-300 hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-bowling-blue-100 group-hover:text-bowling-blue-600 transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 group-hover:text-bowling-blue-700 transition-colors">
                      {option.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
