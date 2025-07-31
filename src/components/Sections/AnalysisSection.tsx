import React, { useState } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Search, 
  X,
  Upload,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'

interface PDFDocument {
  id: string
  fields: {
    titulo: string
    descripcion?: string
    fecha_torneo: string
    categoria?: string
    archivo: Array<{
      id: string
      url: string
      filename: string
      size: number
      type: string
    }>
    fecha_subida?: string
    activo?: boolean
  }
}

export function AnalysisSection() {
  const { data: pdfs, loading, error } = useAirtable('PDFs Torneos', {
    maxRecords: 50,
    sort: [{ field: 'fecha_torneo', direction: 'desc' }]
  })
  
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedPDF, setSelectedPDF] = useState<PDFDocument | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)


  // Filtrar PDFs basado en la búsqueda y que tengan archivo
  const filteredPDFs = pdfs.filter(pdf => {
    // Solo mostrar PDFs que tengan archivo y estén activos
    if (!pdf.fields.archivo || pdf.fields.archivo.length === 0) return false
    if (pdf.fields.activo === false) return false
    
    if (!searchFilter.trim()) return true
    const searchTerm = searchFilter.toLowerCase()
    const title = (pdf.fields.titulo || '').toLowerCase()
    const description = (pdf.fields.descripcion || '').toLowerCase()
    const category = (pdf.fields.categoria || '').toLowerCase()
    return title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)
  })

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Tamaño desconocido'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Error al cargar los documentos de análisis</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-bowling-black-900 mb-4">Análisis de Torneos</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Documentos y reportes detallados de análisis estadísticos de nuestros torneos
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título, descripción o categoría..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid de PDFs */}
      {filteredPDFs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPDFs.map((pdf) => (
            <div key={pdf.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              {/* Header del Card */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {pdf.fields.titulo}
                      </h3>
                      {pdf.fields.categoria && (
                        <span className="inline-block px-2 py-1 bg-bowling-blue-100 text-bowling-blue-800 text-xs font-medium rounded-full mt-1">
                          {pdf.fields.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {pdf.fields.descripcion && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {pdf.fields.descripcion}
                  </p>
                )}
              </div>

              {/* Información */}
              <div className="p-6 pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Torneo: {formatDate(pdf.fields.fecha_torneo)}</span>
                  </div>
                  {pdf.fields.archivo && pdf.fields.archivo[0] && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{formatFileSize(pdf.fields.archivo[0].size)}</span>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const pdfDocument: PDFDocument = {
                        id: pdf.id,
                        fields: {
                          titulo: pdf.fields.titulo || '',
                          descripcion: pdf.fields.descripcion,
                          fecha_torneo: pdf.fields.fecha_torneo || '',
                          categoria: pdf.fields.categoria,
                          archivo: pdf.fields.archivo || [],
                          fecha_subida: pdf.fields.fecha_subida,
                          activo: pdf.fields.activo
                        }
                      }
                      setSelectedPDF(pdfDocument)
                    }}
                    className="flex-1 bg-bowling-blue-600 hover:bg-bowling-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    <span>Ver</span>
                  </button>
                  <a
                    href={pdf.fields.archivo && pdf.fields.archivo[0] ? pdf.fields.archivo[0].url : '#'}
                    download={pdf.fields.archivo && pdf.fields.archivo[0] ? pdf.fields.archivo[0].filename : 'documento.pdf'}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {searchFilter ? 'No se encontraron documentos' : 'No hay documentos de análisis disponibles'}
          </p>
          <p className="text-sm text-gray-500">
            {searchFilter ? 'Intenta con un término de búsqueda diferente' : 'Sube el primer documento para comenzar'}
          </p>
        </div>
      )}

      {/* Modal de Visualización de PDF */}
      {selectedPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedPDF.fields.titulo}</h2>
                <p className="text-white/80 text-sm">
                  {formatDate(selectedPDF.fields.fecha_torneo)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={selectedPDF.fields.archivo && selectedPDF.fields.archivo[0] ? selectedPDF.fields.archivo[0].url : '#'}
                  download={selectedPDF.fields.archivo && selectedPDF.fields.archivo[0] ? selectedPDF.fields.archivo[0].filename : 'documento.pdf'}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </a>
                <button
                  onClick={() => setSelectedPDF(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del PDF */}
            <div className="h-[calc(90vh-80px)] overflow-auto">
              <iframe
                src={selectedPDF.fields.archivo && selectedPDF.fields.archivo[0] ? selectedPDF.fields.archivo[0].url : ''}
                className="w-full h-full border-none"
                title={selectedPDF.fields.titulo}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Subida (placeholder por ahora) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Subir Análisis</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Funcionalidad de subida en desarrollo. Por ahora, agrega los PDFs directamente en Airtable.
            </p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
