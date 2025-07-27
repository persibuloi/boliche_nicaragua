import React, { useState } from 'react'
import { useAirtable } from '@/hooks/useAirtable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Edit, Trash2, RefreshCw } from 'lucide-react'

interface ExampleRecord {
  id: string
  fields: {
    Nombre?: string
    Email?: string
    Telefono?: string
    Fecha?: string
  }
  createdTime: string
}

export function AirtableExample() {
  const [tableName, setTableName] = useState('Contactos') // Cambia por el nombre de tu tabla
  const [newRecord, setNewRecord] = useState({ Nombre: '', Email: '', Telefono: '' })
  const [editingRecord, setEditingRecord] = useState<ExampleRecord | null>(null)
  
  // Usar el hook con opciones avanzadas
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    createRecord, 
    updateRecord, 
    deleteRecord 
  } = useAirtable(tableName, {
    maxRecords: 50,
    sort: [{ field: 'Fecha', direction: 'desc' }]
  })

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRecord({
        ...newRecord,
        Fecha: new Date().toISOString()
      })
      setNewRecord({ Nombre: '', Email: '', Telefono: '' })
    } catch (err) {
      console.error('Error creating record:', err)
    }
  }

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return
    
    try {
      await updateRecord(editingRecord.id, editingRecord.fields)
      setEditingRecord(null)
    } catch (err) {
      console.error('Error updating record:', err)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return
    
    try {
      await deleteRecord(recordId)
    } catch (err) {
      console.error('Error deleting record:', err)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al conectar con Airtable: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Airtable</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de la tabla"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-48"
          />
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Formulario para crear nuevo registro */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Nombre"
                value={newRecord.Nombre}
                onChange={(e) => setNewRecord(prev => ({ ...prev, Nombre: e.target.value }))}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={newRecord.Email}
                onChange={(e) => setNewRecord(prev => ({ ...prev, Email: e.target.value }))}
              />
              <Input
                placeholder="Teléfono"
                value={newRecord.Telefono}
                onChange={(e) => setNewRecord(prev => ({ ...prev, Telefono: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Crear Registro
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registros ({data.length})
            {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin inline" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && data.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  {editingRecord?.id === record.id ? (
                    <form onSubmit={handleUpdateRecord} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Nombre"
                          value={editingRecord.fields.Nombre || ''}
                          onChange={(e) => setEditingRecord(prev => prev ? {
                            ...prev,
                            fields: { ...prev.fields, Nombre: e.target.value }
                          } : null)}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={editingRecord.fields.Email || ''}
                          onChange={(e) => setEditingRecord(prev => prev ? {
                            ...prev,
                            fields: { ...prev.fields, Email: e.target.value }
                          } : null)}
                        />
                        <Input
                          placeholder="Teléfono"
                          value={editingRecord.fields.Telefono || ''}
                          onChange={(e) => setEditingRecord(prev => prev ? {
                            ...prev,
                            fields: { ...prev.fields, Telefono: e.target.value }
                          } : null)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Guardar</Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingRecord(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{record.fields.Nombre || 'Sin nombre'}</h3>
                        <p className="text-sm text-gray-600">{record.fields.Email}</p>
                        <p className="text-sm text-gray-600">{record.fields.Telefono}</p>
                        <p className="text-xs text-gray-400">
                          Creado: {new Date(record.createdTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRecord(record as ExampleRecord)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {data.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No hay registros en esta tabla
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
