import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AdminProvider, useAdmin } from '@/contexts/AdminContext'
import { Header } from '@/components/Layout/Header'
import { Footer } from '@/components/Layout/Footer'
import { HeroSection } from '@/components/Sections/HeroSection'
import { VideosSection } from '@/components/Sections/VideosSection'
import { StatsSection } from '@/components/Sections/StatsSection'
import { StatsMenu } from './components/Sections/StatsMenu'
import { StatsMenuSection } from './components/Sections/StatsMenuSection'
import { AnalysisSection } from './components/Sections/AnalysisSection'
import AIChatSection from './components/Sections/AIChatSection'
import { BowlingSimulator } from './components/Sections/BowlingSimulator'
import { HandicapCalculator } from './components/Sections/HandicapCalculator'
import { ContactSection } from './components/Sections/ContactSection'
import { PodcastSection } from './components/Sections/PodcastSection'
import { TournamentsAirtableSection } from '@/components/Sections/TournamentsAirtableSection'
import { AchievementsSection } from '@/components/Sections/AchievementsSection'
import { AdminLogin } from '@/components/Admin/AdminLogin'
import { AdminDashboard } from '@/components/Admin/AdminDashboard'
import { Settings } from 'lucide-react'
import './App.css'

function AppContent() {
  const [showAdmin, setShowAdmin] = useState(false)
  const { isAdmin, loading } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()

  // Map URL paths to section names for header
  const getCurrentSection = () => {
    const path = location.pathname
    const sectionMap: { [key: string]: string } = {
      '/': 'inicio',
      '/videos': 'videos',
      '/torneos': 'torneos',
      '/estadisticas': 'estadisticas',
      '/menu-estadisticas': 'menu-estadisticas',
      '/calculadora-handicap': 'calculadora-handicap',
      '/simulador-boliche': 'simulador-boliche',
      '/logros-trayectoria': 'logros-trayectoria',
      '/analisis': 'analisis',
      '/contacto': 'contacto',
      '/podcast': 'podcast'
    }
    return sectionMap[path] || 'inicio'
  }

  const handleSectionChange = (section: string) => {
    const routeMap: { [key: string]: string } = {
      'inicio': '/',
      'videos': '/videos',
      'torneos': '/torneos',
      'estadisticas': '/estadisticas',
      'menu-estadisticas': '/menu-estadisticas',
      'calculadora-handicap': '/calculadora-handicap',
      'simulador-boliche': '/simulador-boliche',
      'logros-trayectoria': '/logros-trayectoria',
      'analisis': '/analisis',
      'contacto': '/contacto',
      'podcast': '/podcast'
    }
    const route = routeMap[section] || '/'
    navigate(route)
  }

  // Handle admin access
  if (showAdmin) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500"></div>
        </div>
      )
    }
    
    return isAdmin ? <AdminDashboard /> : <AdminLogin onClose={() => setShowAdmin(false)} />
  }

  // Render main application
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header currentSection={getCurrentSection()} onSectionChange={handleSectionChange} />
      
      {/* Admin Access Button */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl z-50 transition-all hover:scale-110 border-4 border-white"
        title="Panel de Administración"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HeroSection onSectionChange={handleSectionChange} />} />
          <Route path="/videos" element={<VideosSection />} />
          <Route path="/torneos" element={<TournamentsAirtableSection />} />
          <Route path="/estadisticas" element={<StatsMenuSection />} />
          <Route path="/menu-estadisticas" element={
            <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
              <StatsMenu />
            </div>
          } />
          <Route path="/calculadora-handicap" element={<HandicapCalculator />} />
          <Route path="/simulador-boliche" element={<BowlingSimulator />} />
          <Route path="/logros-trayectoria" element={<AchievementsSection />} />
          <Route path="/analisis" element={<AnalysisSection />} />
          <Route path="/ia" element={<AIChatSection />} />
          <Route path="/contacto" element={<ContactSection />} />
          <Route path="/podcast" element={<PodcastSection />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onSectionChange={handleSectionChange} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </Router>
  )
}

export default App