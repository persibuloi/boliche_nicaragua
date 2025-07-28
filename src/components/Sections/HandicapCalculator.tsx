import React, { useState } from 'react'
import { Calculator, Settings, User, Users } from 'lucide-react'

interface HandicapSettings {
  baseScore: number
  menMultiplier: number
  womenMultiplier: number
}

export function HandicapCalculator() {
  const [average, setAverage] = useState<string>('')
  const [gender, setGender] = useState<'men' | 'women'>('men')
  const [handicap, setHandicap] = useState<number | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<HandicapSettings>({
    baseScore: 200,
    menMultiplier: 0.80,
    womenMultiplier: 1.00
  })

  const calculateHandicap = () => {
    const avgNumber = parseFloat(average)
    if (isNaN(avgNumber) || avgNumber <= 0) {
      alert('Por favor ingresa un promedio válido')
      return
    }

    const multiplier = gender === 'men' ? settings.menMultiplier : settings.womenMultiplier
    const calculatedHandicap = Math.round((settings.baseScore - avgNumber) * multiplier)
    
    // El handicap no puede ser negativo
    setHandicap(Math.max(0, calculatedHandicap))
  }

  const handleSettingsChange = (field: keyof HandicapSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-bowling-black-900 mb-2">
              Calculadora de Handicap
            </h1>
            <p className="text-gray-600">
              Calcula tu handicap de boliche basado en tu promedio actual
            </p>
          </div>

          {/* Main Calculator Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Average Input */}
              <div>
                <label className="block text-sm font-medium text-bowling-black-700 mb-2">
                  Tu Promedio Actual
                </label>
                <input
                  type="number"
                  value={average}
                  onChange={(e) => setAverage(e.target.value)}
                  placeholder="Ej: 150"
                  min="0"
                  max="300"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                />
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium text-bowling-black-700 mb-2">
                  Categoría
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setGender('men')}
                    className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all ${
                      gender === 'men'
                        ? 'border-bowling-blue-500 bg-bowling-blue-50 text-bowling-blue-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Hombres
                  </button>
                  <button
                    onClick={() => setGender('women')}
                    className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all ${
                      gender === 'women'
                        ? 'border-bowling-orange-500 bg-bowling-orange-50 text-bowling-orange-700'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Mujeres
                  </button>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateHandicap}
              className="w-full bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-bowling-orange-600 hover:to-bowling-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Calcular Handicap
            </button>

            {/* Result */}
            {handicap !== null && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Tu Handicap Calculado</h3>
                  <div className="text-4xl font-bold text-green-600 mb-2">{handicap}</div>
                  <p className="text-sm text-gray-600">
                    Fórmula utilizada: ({settings.baseScore} - {average}) × {gender === 'men' ? settings.menMultiplier : settings.womenMultiplier}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-bowling-orange-500 mr-2" />
                <span className="font-medium text-bowling-black-900">Configuración Avanzada</span>
              </div>
              <div className={`transform transition-transform ${showSettings ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>

            {showSettings && (
              <div className="mt-6 space-y-4 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puntaje Base
                    </label>
                    <input
                      type="number"
                      value={settings.baseScore}
                      onChange={(e) => handleSettingsChange('baseScore', parseFloat(e.target.value) || 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Multiplicador Hombres
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.menMultiplier}
                      onChange={(e) => handleSettingsChange('menMultiplier', parseFloat(e.target.value) || 0.80)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Multiplicador Mujeres
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.womenMultiplier}
                      onChange={(e) => handleSettingsChange('womenMultiplier', parseFloat(e.target.value) || 1.00)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <strong>Fórmulas actuales:</strong><br/>
                  • Hombres: (Puntaje Base - Promedio) × {settings.menMultiplier}<br/>
                  • Mujeres: (Puntaje Base - Promedio) × {settings.womenMultiplier}
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">¿Qué es el Handicap?</h3>
            <p className="text-blue-800 text-sm">
              El handicap es un sistema que permite que jugadores de diferentes niveles compitan de manera más equitativa. 
              Se suma a tu puntaje real para nivelar las diferencias de habilidad entre los participantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
