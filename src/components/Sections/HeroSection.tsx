import React from 'react'
import { Play, Users, Trophy, Target } from 'lucide-react'

export function HeroSection() {
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
            <button className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              🏆 Ver Torneos
            </button>
            <button className="bg-transparent border-2 border-bowling-blue-500 text-bowling-blue-400 hover:bg-bowling-blue-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200">
              📊 Ver Estadísticas
            </button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-bowling-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comunidad Activa</h3>
              <p className="text-gray-300 text-sm">Más de 200 jugadores registrados en nuestra comunidad</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Torneos Regulares</h3>
              <p className="text-gray-300 text-sm">Torneos cada fin de semana con premios increibles</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mejora tu Juego</h3>
              <p className="text-gray-300 text-sm">Estadísticas detalladas y consejos de profesionales</p>
            </div>
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