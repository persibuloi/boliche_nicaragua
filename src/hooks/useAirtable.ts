import { useState, useEffect } from 'react'

// Obtener variables de entorno
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID

export interface AirtableRecord {
  id: string
  fields: Record<string, any>
  createdTime: string
}

export interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

export interface UseAirtableOptions {
  maxRecords?: number
  view?: string
  filterByFormula?: string
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
}

export function useAirtable(tableName: string, options: UseAirtableOptions = {}) {
  const [data, setData] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      setError('Configuración de Airtable faltante. Verifica las variables de entorno.')
      setLoading(false)
      return
    }
    fetchData()
  }, [tableName, JSON.stringify(options)])

  const buildQueryParams = (options: UseAirtableOptions, offset?: string) => {
    const params = new URLSearchParams()
    
    if (options.maxRecords) params.append('maxRecords', options.maxRecords.toString())
    if (options.view) params.append('view', options.view)
    if (options.filterByFormula) params.append('filterByFormula', options.filterByFormula)
    if (offset) params.append('offset', offset)
    
    if (options.sort) {
      options.sort.forEach((sortItem, index) => {
        params.append(`sort[${index}][field]`, sortItem.field)
        params.append(`sort[${index}][direction]`, sortItem.direction)
      })
    }
    
    return params.toString()
  }

  const fetchData = async (allRecords: AirtableRecord[] = [], offset?: string) => {
    try {
      if (!offset) {
        setLoading(true)
        setError(null)
      }
      
      const queryParams = buildQueryParams(options, offset)
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}${queryParams ? `?${queryParams}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error?.message || 
          `Error ${response.status}: ${response.statusText}`
        )
      }

      const result: AirtableResponse = await response.json()
      const newRecords = [...allRecords, ...(result.records || [])]
      
      // Si hay más páginas y no hemos alcanzado el límite, continuar
      if (result.offset && (!options.maxRecords || newRecords.length < options.maxRecords)) {
        await fetchData(newRecords, result.offset)
      } else {
        setData(newRecords)
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al conectar con Airtable')
      console.error('Airtable fetch error:', err)
      setLoading(false)
    }
  }

  const createRecord = async (fields: Record<string, any>) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`)
      }

      const newRecord = await response.json()
      setData(prev => [...prev, newRecord])
      return newRecord
    } catch (err) {
      console.error('Error creating record:', err)
      throw err
    }
  }

  const updateRecord = async (recordId: string, fields: Record<string, any>) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`)
      }

      const updatedRecord = await response.json()
      setData(prev => prev.map(record => record.id === recordId ? updatedRecord : record))
      return updatedRecord
    } catch (err) {
      console.error('Error updating record:', err)
      throw err
    }
  }

  const deleteRecord = async (recordId: string) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`)
      }

      setData(prev => prev.filter(record => record.id !== recordId))
      return true
    } catch (err) {
      console.error('Error deleting record:', err)
      throw err
    }
  }

  const uploadAttachment = async (file: File): Promise<any> => {
    try {
      console.log('Subiendo archivo a imgbb con API key:', file.name, 'Tamaño:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      
      // Convertir archivo a base64 para imgbb
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remover el prefijo "data:image/...;base64,"
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      // Usar imgbb.com con tu API key real
      const formData = new FormData()
      formData.append('image', base64)
      
      const response = await fetch('https://api.imgbb.com/1/upload?key=e19f238a021e8661c27ea821351813f7', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response from imgbb:', errorText)
        throw new Error(`Error uploading to imgbb: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Respuesta de imgbb:', result)
      
      // Extraer la URL del archivo
      const fileUrl = result.data?.url
      
      if (!fileUrl) {
        console.error('Respuesta completa de imgbb:', result)
        throw new Error('No se pudo obtener la URL del archivo de imgbb')
      }
      
      console.log('URL final para Airtable:', fileUrl)
      
      // Crear el objeto attachment para Airtable
      const attachment = {
        url: fileUrl,
        filename: file.name
      }

      console.log('Attachment creado con URL:', attachment)
      return attachment
    } catch (err) {
      console.error('Error uploading attachment:', err)
      // Fallback: crear torneo sin foto si falla la subida
      throw new Error(`Error subiendo ${file.name}: ${err.message}`)
    }
  }

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(), 
    createRecord, 
    updateRecord, 
    deleteRecord,
    uploadAttachment
  }
}