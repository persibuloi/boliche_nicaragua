import React, { useState } from 'react'
import { Menu, X, CircleDot } from 'lucide-react'

interface HeaderProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

export function Header({ currentSection, onSectionChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'videos', label: 'Videos' },
    { id: 'menu-estadisticas', label: 'Torneo Relámpago' },
    { id: 'estadisticas', label: 'Estadísticas' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'podcast', label: 'Podcast' },
  ]

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-bowling-black-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleSectionClick('inicio')}>
            <div className="w-10 h-10 bg-gradient-to-br from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Boliche Nicaragua</h1>
              <p className="text-sm text-gray-300 hidden sm:block">Comunidad de Bowling</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentSection === item.id
                    ? 'bg-bowling-orange-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-bowling-blue-500/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-bowling-blue-500/20 transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-bowling-black-800 rounded-lg mb-4">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-all duration-200 ${
                    currentSection === item.id
                      ? 'bg-bowling-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-bowling-blue-500/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}