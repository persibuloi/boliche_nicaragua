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

  return { 
    data, 
    loading, 
    error, 
    refetch: () => fetchData(), 
    createRecord, 
    updateRecord, 
    deleteRecord 
  }
}