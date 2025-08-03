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
  Eye,
  Gamepad2,
  FileText,
  ChevronDown,
  Target,
  Wrench,
  Award,
  Bot,
  Sparkles
} from 'lucide-react'

interface HeaderProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

export function Header({ currentSection, onSectionChange }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const navigation = [
    { 
      id: 'inicio', 
      label: 'Inicio', 
      icon: Home, 
      type: 'single' as const
    },
    {
      id: 'torneos-group',
      label: 'Torneos',
      icon: Target,
      type: 'dropdown' as const,
      items: [
        { id: 'torneos', label: 'Fotos Torneos', icon: Trophy },
        { id: 'menu-estadisticas', label: 'Ver Torneos', icon: Eye },
        { id: 'simulador-boliche', label: 'Simulación de Juegos', icon: Gamepad2 },
        { id: 'logros-trayectoria', label: 'Logros y Trayectoria', icon: Award }
      ]
    },
    {
      id: 'herramientas-group',
      label: 'Herramientas',
      icon: Wrench,
      type: 'dropdown' as const,
      items: [
        { id: 'calculadora-handicap', label: 'Calculadora', icon: Calculator },
        { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 }
      ]
    },
    {
      id: 'multimedia-group',
      label: 'Multimedia',
      icon: Play,
      type: 'dropdown' as const,
      items: [
        { id: 'videos', label: 'Videos', icon: Play },
        { id: 'podcast', label: 'Podcast', icon: Mic },
        { id: 'analisis', label: 'Análisis PDFs', icon: FileText }
      ]
    },
    { 
      id: 'ia', 
      label: 'IA', 
      icon: Sparkles, 
      type: 'single' as const
    },
    { 
      id: 'contacto', 
      label: 'Contacto', 
      icon: Mail, 
      type: 'single' as const
    }
  ]

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
  }

  const toggleDropdown = (dropdownId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    console.log('Toggle dropdown:', dropdownId, 'Current active:', activeDropdown)
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)
  }

  const isCurrentSectionInGroup = (items: any[]) => {
    return items.some(item => item.id === currentSection)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null)
    }
    
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [activeDropdown])

  return (
    <header className="bg-gradient-to-r from-bowling-black-900 via-bowling-black-800 to-bowling-black-900 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm border-b border-bowling-orange-500/10 overflow-visible">
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleSectionClick('inicio')}>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-bowling-orange-500/25 transition-all duration-300 group-hover:scale-105 p-2">
              <img 
                src="/logo-header.svg" 
                alt="Boliche Nicaragua Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Boliche Nicaragua</h1>
              <p className="text-sm text-bowling-orange-400 hidden sm:block font-medium">Comunidad de Bowling</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 relative">
            {navigation.map((item) => {
              const IconComponent = item.icon
              
              if (item.type === 'single') {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSectionClick(item.id)
                      }
                    }}
                    aria-label={`Navegar a ${item.label}`}
                    aria-current={currentSection === item.id ? 'page' : undefined}
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bowling-orange-500 focus:ring-offset-2 focus:ring-offset-bowling-black-900 ${
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
              }
              
              // Dropdown menu
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={(e) => toggleDropdown(item.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveDropdown(activeDropdown === item.id ? null : item.id)
                      } else if (e.key === 'Escape' && activeDropdown === item.id) {
                        setActiveDropdown(null)
                      }
                    }}
                    aria-label={`${item.label} - ${activeDropdown === item.id ? 'Cerrar' : 'Abrir'} menú`}
                    aria-expanded={activeDropdown === item.id}
                    aria-haspopup="menu"
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-bowling-orange-500 focus:ring-offset-2 focus:ring-offset-bowling-black-900 ${
                      isCurrentSectionInGroup(item.items || []) || activeDropdown === item.id
                        ? 'bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 text-white shadow-lg shadow-bowling-orange-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-bowling-blue-500/20 hover:to-bowling-orange-500/20 hover:shadow-md'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 transition-all duration-300 ${
                      isCurrentSectionInGroup(item.items || []) || activeDropdown === item.id ? 'text-white' : 'text-gray-400 group-hover:text-bowling-orange-400'
                    }`} />
                    <span className="hidden lg:block">{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdown === item.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {activeDropdown === item.id && (
                    <div 
                      role="menu"
                      aria-labelledby={`dropdown-${item.id}`}
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2"
                      style={{ zIndex: 9999 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.items?.map((subItem) => {
                        const SubIconComponent = subItem.icon
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSectionClick(subItem.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleSectionClick(subItem.id)
                              } else if (e.key === 'Escape') {
                                setActiveDropdown(null)
                              }
                            }}
                            role="menuitem"
                            aria-label={`Navegar a ${subItem.label}`}
                            aria-current={currentSection === subItem.id ? 'page' : undefined}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-bowling-orange-500 focus:ring-inset ${
                              currentSection === subItem.id
                                ? 'bg-bowling-orange-50 text-bowling-orange-600 border-r-2 border-bowling-orange-500'
                                : 'text-gray-700 hover:text-bowling-orange-600'
                            }`}
                          >
                            <SubIconComponent className={`w-4 h-4 ${
                              currentSection === subItem.id ? 'text-bowling-orange-600' : 'text-gray-500'
                            }`} />
                            <span>{subItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
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
                
                if (item.type === 'single') {
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
                }
                
                // Dropdown group for mobile
                return (
                  <div key={item.id} className="space-y-1">
                    {/* Group Header */}
                    <div className="flex items-center space-x-3 px-4 py-2 text-bowling-orange-400 text-sm font-semibold uppercase tracking-wide">
                      <IconComponent className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    
                    {/* Group Items */}
                    {item.items?.map((subItem) => {
                      const SubIconComponent = subItem.icon
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSectionClick(subItem.id)}
                          className={`flex items-center space-x-3 px-8 py-3 rounded-lg text-base font-medium w-full text-left transition-all duration-300 transform hover:scale-[1.02] ${
                            currentSection === subItem.id
                              ? 'bg-gradient-to-r from-bowling-orange-500 to-bowling-orange-600 text-white shadow-lg'
                              : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-bowling-blue-500/20 hover:to-bowling-orange-500/20'
                          }`}
                        >
                          <SubIconComponent className={`w-5 h-5 ${
                            currentSection === subItem.id ? 'text-white' : 'text-gray-400'
                          }`} />
                          <span>{subItem.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}