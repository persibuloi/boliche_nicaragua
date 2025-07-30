import React, { useState } from 'react'
import { Calendar, Trophy, Users, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAirtable } from '@/hooks/useAirtable'

interface TournamentRecord {
  id: string
  fields: {
    Torneo?: string
    Fecha?: string
    Ubicacion?: string
    Descripcion?: string
    Ganador?: string
    Subcampeón?: string
    Subcampeon?: string // Campo sin tilde para compatibilidad con Airtable
    Participantes?: number
    Premio?: string
    Categoria?: string
    Foto?: Array<{
      id: string
      url: string
      filename: string
      size: number
      type: string
    }>
    Activo?: boolean
  }
  createdTime: string
}

const categoryColors = {
  profesional: 'from-yellow-500 to-orange-500',
  amateur: 'from-blue-500 to-purple-500',
  juvenil: 'from-green-500 to-teal-500',
  veteranos: 'from-red-500 to-pink-500'
}

const categoryLabels = {
  profesional: 'Profesional',
  amateur: 'Amateur',
  juvenil: 'Juvenil',
  veteranos: 'Veteranos'
}

export function TournamentsAirtableSection() {
  const [selectedTournament, setSelectedTournament] = useState<TournamentRecord | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Usar el hook de Airtable
  const { data: tournaments, loading, error } = useAirtable('Torneo Fotos', {
    maxRecords: 100,
    sort: [{ field: 'Fecha', direction: 'desc' }],
    filterByFormula: '{Activo} = TRUE()'
  })

  // Filtrar torneos por categoría
  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedCategory === 'todos') return true
    return tournament.fields.Categoria === selectedCategory
  })

  // Funciones para el carrusel de imágenes
  const openModal = (tournament: TournamentRecord) => {
    setSelectedTournament(tournament)
    setCurrentImageIndex(0) // Resetear al primer imagen
  }

  const closeModal = () => {
    setSelectedTournament(null)
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    if (selectedTournament?.fields.Foto && selectedTournament.fields.Foto.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedTournament.fields.Foto.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedTournament?.fields.Foto && selectedTournament.fields.Foto.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedTournament.fields.Foto.length - 1 : prev - 1
      )
    }
  }

  // Funciones para el lightbox
  const openLightbox = () => {
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  // Navegación con teclado para el lightbox
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevImage()
    } else if (e.key === 'ArrowRight') {
      nextImage()
    } else if (e.key === 'Escape') {
      closeLightbox()
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando torneos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Torneos</h2>
            <p className="text-red-600 mb-4">Error al cargar los torneos: {error}</p>
            <p className="text-gray-600">Por favor, verifica la configuración de Airtable.</p>
          </div>
        </div>
      </section>
    )
  }

  if (tournaments.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Torneos</h2>
            <p className="text-gray-600">No hay torneos disponibles en este momento.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Torneos de Boliche
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revive los momentos más emocionantes de nuestros torneos. Conoce a los campeones, 
            ve las mejores jugadas y mantente al día con los próximos eventos.
          </p>
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === 'todos'
                ? 'bg-bowling-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            Todos los Torneos
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === key
                  ? 'bg-bowling-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid de torneos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => openModal(tournament)}
            >
              {/* Imagen del torneo */}
              <div className="relative h-48 overflow-hidden">
                {tournament.fields.Foto && tournament.fields.Foto.length > 0 ? (
                  <img
                    src={tournament.fields.Foto[0].url}
                    alt={tournament.fields.Torneo}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-bowling-blue-500 to-bowling-orange-500 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${
                  categoryColors[tournament.fields.Categoria as keyof typeof categoryColors] || 'from-gray-500 to-gray-600'
                }`}>
                  {categoryLabels[tournament.fields.Categoria as keyof typeof categoryLabels] || tournament.fields.Categoria}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {tournament.fields.Torneo}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {tournament.fields.Fecha ? new Date(tournament.fields.Fecha).toLocaleDateString('es-ES') : 'Fecha por confirmar'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{tournament.fields.Ubicacion || 'Ubicación por confirmar'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">{tournament.fields.Participantes || 0} participantes</span>
                  </div>
                </div>

                {tournament.fields.Ganador && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Campeón</p>
                        <p className="font-semibold text-gray-800">{tournament.fields.Ganador}</p>
                      </div>
                    </div>
                    {tournament.fields.Premio && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Premio</p>
                        <p className="font-semibold text-green-600">{tournament.fields.Premio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay torneos en esta categoría
            </h3>
            <p className="text-gray-500">
              Selecciona otra categoría o vuelve más tarde para ver nuevos torneos.
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedTournament(null)}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Carrusel de imágenes */}
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-xl">
                {selectedTournament.fields.Foto && selectedTournament.fields.Foto.length > 0 ? (
                  <>
                    <img
                      src={selectedTournament.fields.Foto[currentImageIndex].url}
                      alt={`${selectedTournament.fields.Torneo} - Imagen ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300 cursor-pointer hover:opacity-90"
                      onClick={openLightbox}
                      title="Haz clic para ver en pantalla completa"
                    />
                    
                    {/* Navegación del carrusel - solo mostrar si hay más de una imagen */}
                    {selectedTournament.fields.Foto.length > 1 && (
                      <>
                        {/* Botón anterior */}
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        
                        {/* Botón siguiente */}
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        {/* Indicadores de página */}
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                          {selectedTournament.fields.Foto.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'bg-white' 
                                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Contador de imágenes */}
                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {selectedTournament.fields.Foto.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-bowling-blue-500 to-bowling-orange-500 flex items-center justify-center">
                    <Trophy className="w-24 h-24 text-white opacity-50" />
                  </div>
                )}
                
                {/* Etiqueta de categoría */}
                <div className="absolute bottom-4 left-4">
                  <div className={`px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r ${
                    categoryColors[selectedTournament.fields.Categoria as keyof typeof categoryColors] || 'from-gray-500 to-gray-600'
                  }`}>
                    {categoryLabels[selectedTournament.fields.Categoria as keyof typeof categoryLabels] || selectedTournament.fields.Categoria}
                  </div>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  {selectedTournament.fields.Torneo}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-bowling-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p className="font-semibold">
                          {selectedTournament.fields.Fecha ? new Date(selectedTournament.fields.Fecha).toLocaleDateString('es-ES') : 'Por confirmar'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-bowling-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Ubicación</p>
                        <p className="font-semibold">{selectedTournament.fields.Ubicacion || 'Por confirmar'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-bowling-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Participantes</p>
                        <p className="font-semibold">{selectedTournament.fields.Participantes || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedTournament.fields.Ganador && (
                      <div className="flex items-center">
                        <Trophy className="w-5 h-5 text-yellow-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Campeón</p>
                          <p className="font-semibold">{selectedTournament.fields.Ganador}</p>
                        </div>
                      </div>
                    )}

                    {(selectedTournament.fields.Subcampeón || selectedTournament.fields.Subcampeon) && (
                      <div className="flex items-center">
                        <Trophy className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Subcampeón</p>
                          <p className="font-semibold">{selectedTournament.fields.Subcampeón || selectedTournament.fields.Subcampeon}</p>
                        </div>
                      </div>
                    )}

                    {selectedTournament.fields.Premio && (
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm text-gray-500">Premio</p>
                          <p className="font-semibold text-green-600">{selectedTournament.fields.Premio}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTournament.fields.Descripcion && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedTournament.fields.Descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox para vista ampliada */}
      {isLightboxOpen && selectedTournament?.fields.Foto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-[60]"
          onClick={closeLightbox}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Imagen ampliada */}
            <img
              src={selectedTournament.fields.Foto[currentImageIndex].url}
              alt={`${selectedTournament.fields.Torneo} - Imagen ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navegación del lightbox - solo mostrar si hay más de una imagen */}
            {selectedTournament.fields.Foto.length > 1 && (
              <>
                {/* Botón anterior */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition-all duration-200"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                {/* Botón siguiente */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition-all duration-200"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>

                {/* Indicadores de página en el lightbox */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {selectedTournament.fields.Foto.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>

                {/* Contador de imágenes en el lightbox */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-lg font-medium">
                  {currentImageIndex + 1} / {selectedTournament.fields.Foto.length}
                </div>
              </>
            )}

            {/* Información del torneo en el lightbox */}
            <div className="absolute bottom-8 right-8 bg-black bg-opacity-75 text-white p-4 rounded-lg max-w-sm">
              <h3 className="font-bold text-lg mb-1">{selectedTournament.fields.Torneo}</h3>
              <p className="text-sm opacity-90">
                {selectedTournament.fields.Fecha ? new Date(selectedTournament.fields.Fecha).toLocaleDateString('es-ES') : 'Fecha por confirmar'}
              </p>
              {selectedTournament.fields.Ubicacion && (
                <p className="text-sm opacity-90">{selectedTournament.fields.Ubicacion}</p>
              )}
            </div>

            {/* Instrucciones de navegación */}
            <div className="absolute bottom-8 left-8 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
              <p className="mb-1">← → Navegar</p>
              <p>ESC Cerrar</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
