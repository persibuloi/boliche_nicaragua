import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminContextType {
  isAdmin: boolean
  adminData: any
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  verifyToken: () => Promise<boolean>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyExistingToken()
  }, [])

  const verifyExistingToken = async () => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      const isValid = await verifyToken()
      if (!isValid) {
        localStorage.removeItem('admin_token')
        setIsAdmin(false)
        setAdminData(null)
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'login',
          email,
          password
        }
      })

      if (error) throw error

      const token = data.data.token
      const admin = data.data.admin

      localStorage.setItem('admin_token', token)
      setIsAdmin(true)
      setAdminData(admin)
      return true
    } catch (error) {
      console.error('Admin login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setIsAdmin(false)
    setAdminData(null)
  }

  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return false

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'verify'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (error) throw error

      if (data.data.valid) {
        setIsAdmin(true)
        setAdminData(data.data.admin)
        return true
      }
      return false
    } catch (error) {
      console.error('Token verification error:', error)
      return false
    }
  }

  return (
    <AdminContext.Provider value={{
      isAdmin,
      adminData,
      loading,
      login,
      logout,
      verifyToken
    }}>
      {children}
    </AdminContext.Provider>
  )
}