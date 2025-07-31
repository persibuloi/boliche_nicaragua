import React from 'react'
import { Play, Users, Trophy, Target, Camera, Calculator, Mic, Gamepad2 } from 'lucide-react'

interface HeroSectionProps {
  onSectionChange?: (section: string) => void
}

export function HeroSection({ onSectionChange }: HeroSectionProps) {
  const handleTorneosClick = () => {
    console.log('Botón Torneos clickeado, navegando a menu-estadisticas')
    if (onSectionChange) {
      onSectionChange('menu-estadisticas')
    } else {
      console.error('onSectionChange no está disponible')
    }
  }

  const handleEstadisticasClick = () => {
    console.log('Botón Estadísticas clickeado, navegando a estadisticas')
    if (onSectionChange) {
      onSectionChange('estadisticas')
    } else {
      console.error('onSectionChange no está disponible')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/bowling-hero.jpg"
          alt="Bolera moderna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-bowling-black-900/80 via-bowling-blue-900/60 to-bowling-orange-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Main title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-bowling-orange-400 to-bowling-blue-400 bg-clip-text text-transparent">
            Boliche Nicaragua
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Únete a la comunidad de bowling más vibrante de Nicaragua. 
            Torneos, estadísticas, videos y mucho más.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={handleTorneosClick}
              className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🏆 Ver Torneos
            </button>
            <button 
              onClick={handleEstadisticasClick}
              className="bg-transparent border-2 border-bowling-blue-500 text-bowling-blue-400 hover:bg-bowling-blue-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200"
            >
              📊 Ver Estadísticas
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            <button 
              onClick={() => onSectionChange?.('videos')}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Videos</h3>
              <p className="text-gray-300 text-sm">Contenido multimedia de la comunidad de boliche</p>
            </button>

            <button 
              onClick={() => onSectionChange?.('torneos')}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="w-12 h-12 bg-bowling-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fotos Torneos</h3>
              <p className="text-gray-300 text-sm">Galería completa de fotos de todos nuestros torneos</p>
            </button>

            <button 
              onClick={() => onSectionChange?.('calculadora-handicap')}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calculadora</h3>
              <p className="text-gray-300 text-sm">Calcula tu handicap personalizado con parámetros ajustables</p>
            </button>

            <button 
              onClick={() => onSectionChange?.('simulador-boliche')}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Simulación</h3>
              <p className="text-gray-300 text-sm">Simula partidas de boliche con múltiples jugadores</p>
            </button>

            <button 
              onClick={() => onSectionChange?.('podcast')}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Podcast</h3>
              <p className="text-gray-300 text-sm">Escucha nuestro contenido de audio sobre boliche</p>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}