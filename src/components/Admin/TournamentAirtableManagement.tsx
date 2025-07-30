import React, { useState } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Trophy,
  Calendar,
  MapPin,
  Users,
  X,
  Save,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Image
} from 'lucide-react'

interface TournamentRecord {
  id: string
  fields: {
    Torneo?: string
    Fecha?: string
    Ubicacion?: string
    Descripcion?: string
    Ganador?: string
    Subcampeón?: string
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

export function TournamentAirtableManagement() {
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TournamentRecord | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [adminImageIndex, setAdminImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    Torneo: '',
    Fecha: '',
    Ubicacion: '',
    Descripcion: '',
    Ganador: '',
    Subcampeón: '',
    Participantes: 0,
    Premio: '',
    Categoria: 'profesional',
    Foto: [] as Array<{
      id: string
      url: string
      filename: string
      size: number
      type: string
    }>,
    Activo: true
  })

  // Usar el hook de Airtable
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    createRecord, 
    updateRecord, 
    deleteRecord,
    uploadAttachment
  } = useAirtable('Torneo Fotos', {
    maxRecords: 100,
    sort: [{ field: 'Fecha', direction: 'desc' }]
  })

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      // Procesar archivos si hay alguno seleccionado
      let attachments = []
      if (selectedFiles.length > 0) {
        console.log('🚀 INICIANDO SUBIDA DE', selectedFiles.length, 'ARCHIVOS:')
        selectedFiles.forEach((file, index) => {
          console.log(`  📁 Archivo ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
        })
        
        // Procesar archivos uno por uno con logs detallados
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          console.log(`\n⬆️ SUBIENDO ARCHIVO ${i + 1}/${selectedFiles.length}: ${file.name}`)
          
          try {
            const attachment = await uploadAttachment(file)
            if (attachment && attachment.url) {
              attachments.push(attachment)
              console.log(`✅ ÉXITO ${i + 1}/${selectedFiles.length}: ${file.name}`)
              console.log(`   📎 URL generada: ${attachment.url}`)
            } else {
              console.error(`❌ ERROR ${i + 1}/${selectedFiles.length}: ${file.name} - No se generó URL válida`)
              console.error('   📄 Respuesta recibida:', attachment)
            }
          } catch (uploadError) {
            console.error(`❌ ERROR ${i + 1}/${selectedFiles.length}: ${file.name}`)
            console.error('   🔍 Detalles del error:', uploadError)
            // Continuar con los demás archivos
          }
        }
        
        console.log(`\n📊 RESUMEN DE SUBIDA:`)
        console.log(`   ✅ Exitosas: ${attachments.length}`)
        console.log(`   ❌ Fallidas: ${selectedFiles.length - attachments.length}`)
        console.log(`   📎 URLs generadas:`, attachments.map(a => a.url))
      }

      // Crear registro con los campos exactos de Airtable
      const recordData = {
        Torneo: formData.Torneo,
        Fecha: formData.Fecha,
        Ubicacion: formData.Ubicacion,
        Descripcion: formData.Descripcion,
        // Solo enviar campos opcionales si tienen valores válidos
        ...(formData.Ganador && formData.Ganador.trim() !== '' && { Ganador: formData.Ganador.trim() }),
        ...(formData.Subcampeón && formData.Subcampeón.trim() !== '' && { Subcampeon: formData.Subcampeón.trim() }),
        Participantes: parseInt(formData.Participantes.toString()) || 0,
        // Campo Premio: Número con formato moneda
        ...(formData.Premio && formData.Premio.trim() !== '' && !isNaN(Number(formData.Premio.trim())) && {
          Premio: Number(formData.Premio.trim())
        }),
        Categoria: formData.Categoria,
        Activo: formData.Activo,
        ...(attachments.length > 0 && { Foto: attachments })
      }
      
      console.log('\n💾 ENVIANDO DATOS A AIRTABLE:')
      console.log('   🏆 Torneo:', recordData.Torneo)
      console.log('   📅 Fecha:', recordData.Fecha)
      console.log('   📍 Ubicación:', recordData.Ubicacion)
      console.log('   🏅 Ganador:', recordData.Ganador)
      console.log('   👥 Participantes:', recordData.Participantes)
      console.log('   💰 Premio:', recordData.Premio)
      console.log('   📂 Categoría:', recordData.Categoria)
      console.log('   ✅ Activo:', recordData.Activo)
      console.log('   📸 Fotos a guardar:', attachments.length)
      
      if (recordData.Foto && recordData.Foto.length > 0) {
        console.log('   📎 URLs de fotos:')
        recordData.Foto.forEach((foto, index) => {
          console.log(`     ${index + 1}. ${foto.filename}: ${foto.url}`)
        })
      }

      console.log('\n🚀 CREANDO REGISTRO EN AIRTABLE...')
      const createdRecord = await createRecord(recordData)
      console.log('✅ REGISTRO CREADO EXITOSAMENTE:', createdRecord)
      
      resetForm()
      setSelectedFiles([])
      setShowForm(false)
      
      // Mensaje de éxito más detallado
      const successMessage = attachments.length > 0 
        ? `¡Torneo "${formData.Torneo}" creado exitosamente con ${attachments.length} foto(s)!`
        : `¡Torneo "${formData.Torneo}" creado exitosamente!`
      
      alert(successMessage)
      console.log('🎉 PROCESO COMPLETADO:', successMessage)
    } catch (err) {
      console.error('Error creating tournament:', err)
      alert('Error al crear el torneo. Por favor intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return
    
    try {
      // Enviar campos con nombres exactos de Airtable
      const updateData = {
        Torneo: formData.Torneo,
        Fecha: formData.Fecha,
        Ubicacion: formData.Ubicacion,
        Descripcion: formData.Descripcion,
        Ganador: formData.Ganador,
        Subcampeon: formData.Subcampeón, // Sin tilde como en Airtable
        Participantes: formData.Participantes || undefined,
        Premio: formData.Premio || undefined,
        Categoria: formData.Categoria,
        Activo: formData.Activo // Campo checkbox en Airtable
        // Foto: omitido para evitar errores
      }
      
      await updateRecord(editingRecord.id, updateData)
      setEditingRecord(null)
      resetForm()
      alert('Torneo actualizado exitosamente.')
    } catch (err) {
      console.error('Error updating tournament:', err)
      alert('Error al actualizar el torneo. Por favor intenta de nuevo.')
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este torneo?')) return
    
    try {
      await deleteRecord(recordId)
    } catch (err) {
      console.error('Error deleting tournament:', err)
      alert('Error al eliminar el torneo. Por favor intenta de nuevo.')
    }
  }

  const toggleActiveStatus = async (record: TournamentRecord) => {
    try {
      await updateRecord(record.id, {
        ...record.fields,
        Activo: !record.fields.Activo
      })
    } catch (err) {
      console.error('Error toggling tournament status:', err)
      alert('Error al cambiar el estado del torneo.')
    }
  }

  const resetForm = () => {
    setFormData({
      Torneo: '',
      Fecha: '',
      Ubicacion: '',
      Descripcion: '',
      Ganador: '',
      Subcampeón: '',
      Participantes: 0,
      Premio: '',
      Categoria: 'profesional',
      Foto: [],
      Activo: true
    })
    setSelectedFiles([])
    setShowForm(false)
    setEditingRecord(null)
  }

  const startEdit = (record: TournamentRecord) => {
    setEditingRecord(record)
    setFormData({
      Torneo: record.fields.Torneo || '',
      Fecha: record.fields.Fecha || '',
      Ubicacion: record.fields.Ubicacion || '',
      Descripcion: record.fields.Descripcion || '',
      Ganador: record.fields.Ganador || '',
      Subcampeón: record.fields.Subcampeón || '',
      Participantes: record.fields.Participantes || 0,
      Premio: record.fields.Premio || '',
      Categoria: record.fields.Categoria || 'profesional',
      Foto: record.fields.Foto || [],
      Activo: record.fields.Activo !== false
    })
    setShowForm(true)
  }

  const categoryLabels = {
    profesional: 'Profesional',
    amateur: 'Amateur',
    juvenil: 'Juvenil',
    veteranos: 'Veteranos'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando torneos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          Error al cargar los torneos: {error}
          <Button onClick={refetch} variant="outline" size="sm" className="ml-2">
            <RefreshCw className="w-4 h-4 mr-1" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Gestión de Torneos
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Actualizar
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-bowling-orange-500 hover:bg-bowling-orange-600">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo Torneo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingRecord ? 'Editar Torneo' : 'Nuevo Torneo'}
                  <Button onClick={resetForm} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingRecord ? handleUpdateRecord : handleCreateRecord} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre del Torneo</label>
                      <Input
                        value={formData.Torneo}
                        onChange={(e) => setFormData({ ...formData, Torneo: e.target.value })}
                        placeholder="Ej: Torneo Nacional de Boliche 2024"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha</label>
                      <Input
                        type="date"
                        value={formData.Fecha}
                        onChange={(e) => setFormData({ ...formData, Fecha: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ubicación</label>
                      <Input
                        value={formData.Ubicacion}
                        onChange={(e) => setFormData({ ...formData, Ubicacion: e.target.value })}
                        placeholder="Ej: Bowling Center Managua"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ganador</label>
                      <Input
                        value={formData.Ganador}
                        onChange={(e) => setFormData({ ...formData, Ganador: e.target.value })}
                        placeholder="Nombre del ganador"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subcampeón</label>
                      <Input
                        value={formData.Subcampeón}
                        onChange={(e) => setFormData({ ...formData, Subcampeón: e.target.value })}
                        placeholder="Nombre del subcampeón"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Participantes</label>
                      <Input
                        type="number"
                        value={formData.Participantes}
                        onChange={(e) => setFormData({ ...formData, Participantes: parseInt(e.target.value) || 0 })}
                        placeholder="Número de participantes"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Premio</label>
                      <Input
                        value={formData.Premio}
                        onChange={(e) => setFormData({ ...formData, Premio: e.target.value })}
                        placeholder="Ej: $500 USD"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoría</label>
                      <select
                        value={formData.Categoria}
                        onChange={(e) => setFormData({ ...formData, Categoria: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bowling-orange-500"
                      >
                        <option value="profesional">Profesional</option>
                        <option value="amateur">Amateur</option>
                        <option value="juvenil">Juvenil</option>
                        <option value="veteranos">Veteranos</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Fotos del Torneo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-bowling-orange-300 transition-colors">
                      <div className="text-center">
                        <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            console.log('📁 Archivos seleccionados:', files.length)
                            files.forEach((file, index) => {
                              console.log(`  ${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`)
                            })
                            setSelectedFiles(files)
                          }}
                          className="w-full mb-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bowling-orange-50 file:text-bowling-orange-700 hover:file:bg-bowling-orange-100"
                          disabled={uploading}
                        />
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">📸 Selecciona múltiples imágenes:</p>
                          <p className="text-xs">• <strong>Windows:</strong> Mantén Ctrl + clic en cada imagen</p>
                          <p className="text-xs">• <strong>Mac:</strong> Mantén Cmd + clic en cada imagen</p>
                          <p className="text-xs">• <strong>O:</strong> Selecciona un rango con Shift + clic</p>
                          <p className="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, GIF, WEBP</p>
                        </div>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600">
                            {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''} seleccionado{selectedFiles.length !== 1 ? 's' : ''}
                          </p>
                          <ul className="text-xs text-gray-600 mt-1">
                            {selectedFiles.map((file, index) => (
                              <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {formData.Foto && formData.Foto.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm text-blue-600">
                            {formData.Foto.length} imagen{formData.Foto.length !== 1 ? 'es' : ''} ya cargada{formData.Foto.length !== 1 ? 's' : ''} en Airtable
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={formData.Descripcion}
                      onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                      placeholder="Descripción del torneo..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bowling-orange-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.Activo}
                      onChange={(e) => setFormData({ ...formData, Activo: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="activo" className="text-sm font-medium">
                      Torneo activo (visible en la página pública)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-bowling-orange-500 hover:bg-bowling-orange-600"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Subiendo imágenes...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          {editingRecord ? 'Actualizar' : 'Crear'} Torneo
                        </>
                      )}
                    </Button>
                    <Button type="button" onClick={resetForm} variant="outline" disabled={uploading}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de torneos */}
          <div className="space-y-4">
            {data.map((tournament) => (
              <Card key={tournament.id} className="border-l-4 border-l-bowling-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tournament.fields.Torneo || 'Sin título'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tournament.fields.Activo !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tournament.fields.Activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {categoryLabels[tournament.fields.Categoria as keyof typeof categoryLabels] || tournament.fields.Categoria}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {tournament.fields.Fecha ? new Date(tournament.fields.Fecha).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {tournament.fields.Ubicacion || 'Sin ubicación'}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          {tournament.fields.Participantes || 0} participantes
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                          <span className="font-medium">{tournament.fields.Ganador || 'Sin ganador'}</span>
                        </div>
                        {tournament.fields.Subcampeón && (
                          <div className="flex items-center">
                            <span className="text-gray-400">Subcampeón:</span>
                            <span className="ml-1 font-medium">{tournament.fields.Subcampeón}</span>
                          </div>
                        )}
                        {tournament.fields.Premio && (
                          <div className="flex items-center">
                            <span className="text-green-600 font-medium">{tournament.fields.Premio}</span>
                          </div>
                        )}
                      </div>
                      
                      {tournament.fields.Descripcion && (
                        <p className="text-sm text-gray-700 mb-2">
                          {tournament.fields.Descripcion}
                        </p>
                      )}
                      
                      {tournament.fields.Foto && tournament.fields.Foto.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{tournament.fields.Foto.length} imagen{tournament.fields.Foto.length !== 1 ? 'es' : ''} disponible{tournament.fields.Foto.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => toggleActiveStatus(tournament)}
                        variant="outline"
                        size="sm"
                        title={tournament.fields.Activo !== false ? 'Desactivar' : 'Activar'}
                      >
                        {tournament.fields.Activo !== false ? 
                          <EyeOff className="w-4 h-4" /> : 
                          <Eye className="w-4 h-4" />
                        }
                      </Button>
                      <Button
                        onClick={() => startEdit(tournament)}
                        variant="outline"
                        size="sm"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRecord(tournament.id)}
                        variant="destructive"
                        size="sm"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {data.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay torneos registrados</p>
                <p className="text-sm">Haz clic en "Nuevo Torneo" para agregar el primero</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
