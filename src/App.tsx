import React, { useState } from 'react'
import { AdminProvider, useAdmin } from '@/contexts/AdminContext'
import { Header } from '@/components/Layout/Header'
import { Footer } from '@/components/Layout/Footer'
import { HeroSection } from '@/components/Sections/HeroSection'
import { VideosSection } from '@/components/Sections/VideosSection'
import { StatsSection } from '@/components/Sections/StatsSection'
import { StatsMenu } from './components/Sections/StatsMenu'
import { StatsMenuSection } from './components/Sections/StatsMenuSection'
import { AnalysisSection } from './components/Sections/AnalysisSection'
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
  const [currentSection, setCurrentSection] = useState('inicio')
  const [showAdmin, setShowAdmin] = useState(false)
  const { isAdmin, loading } = useAdmin()

  const handleSectionChange = (section: string) => {
    console.log(`Cambiando sección de '${currentSection}' a '${section}'`)
    setCurrentSection(section)
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
      <Header currentSection={currentSection} onSectionChange={handleSectionChange} />
      
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
        {currentSection === 'inicio' && <HeroSection onSectionChange={handleSectionChange} />}
        {currentSection === 'videos' && <VideosSection />}
        {currentSection === 'torneos' && <TournamentsAirtableSection />}
        {currentSection === 'estadisticas' && <StatsMenuSection />}
        {currentSection === 'menu-estadisticas' && (
          <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
            <StatsMenu />
          </div>
        )}
        {currentSection === 'calculadora-handicap' && <HandicapCalculator />}
        {currentSection === 'simulador-boliche' && <BowlingSimulator />}
        {currentSection === 'logros-trayectoria' && <AchievementsSection />}
        {currentSection === 'contacto' && <ContactSection />}
        {currentSection === 'podcast' && <PodcastSection />}
      </main>

      {/* Footer */}
      <Footer onSectionChange={handleSectionChange} />
    </div>
  )
}

function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  )
}

export default App