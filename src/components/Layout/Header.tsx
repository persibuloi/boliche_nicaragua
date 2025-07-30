import React, { useState } from 'react'
import { 
  Menu, 
  X, 
  CircleDot, 
  Home, 
  Play, 
  Trophy, 
  Zap, 
  BarChart3, 
  Mail, 
  Mic,
  Calculator,
  Eye
} from 'lucide-react'

interface HeaderProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

export function Header({ currentSection, onSectionChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'torneos', label: 'Fotos Torneos', icon: Trophy },
    { id: 'menu-estadisticas', label: 'Ver Torneos', icon: Eye },
    { id: 'calculadora-handicap', label: 'Calculadora', icon: Calculator },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'contacto', label: 'Contacto', icon: Mail },
    { id: 'podcast', label: 'Podcast', icon: Mic },
  ]

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-gradient-to-r from-bowling-black-900 via-bowling-black-800 to-bowling-black-900 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm border-b border-bowling-orange-500/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleSectionClick('inicio')}>
            <div className="w-12 h-12 bg-gradient-to-br from-bowling-orange-500 via-bowling-orange-400 to-bowling-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-bowling-orange-500/25 transition-all duration-300 group-hover:scale-105">
              <CircleDot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Boliche Nicaragua</h1>
              <p className="text-sm text-bowling-orange-400 hidden sm:block font-medium">Comunidad de Bowling</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    currentSection === item.id
                      ? 'bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 text-white shadow-lg shadow-bowling-orange-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-bowling-blue-500/20 hover:to-bowling-orange-500/20 hover:shadow-md'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 transition-all duration-300 ${
                    currentSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-bowling-orange-400'
                  }`} />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-bowling-blue-500/20 hover:to-bowling-orange-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-2 bg-gradient-to-br from-bowling-black-800 to-bowling-black-900 rounded-xl mb-4 shadow-xl">
              {navigation.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium w-full text-left transition-all duration-300 transform hover:scale-[1.02] ${
                      currentSection === item.id
                        ? 'bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-bowling-blue-500/20 hover:to-bowling-orange-500/20'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${
                      currentSection === item.id ? 'text-white' : 'text-gray-400'
                    }`} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}