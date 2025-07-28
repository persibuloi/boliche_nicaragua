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
      
      // Obtener usuarios de localStorage
      const savedUsers = localStorage.getItem('admin_users')
      let users = []
      
      if (savedUsers) {
        users = JSON.parse(savedUsers)
      } else {
        // Inicializar con usuario por defecto si no existe
        users = [
          {
            id: '1',
            name: 'Administrador Principal',
            email: 'admin@boliche-nicaragua.com',
            password: 'admin123',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]
        localStorage.setItem('admin_users', JSON.stringify(users))
      }
      
      // Buscar usuario por email y contraseña
      const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.is_active === true
      )
      
      if (!user) {
        return false
      }
      
      // Actualizar último login
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, last_login: new Date().toISOString() }
          : u
      )
      localStorage.setItem('admin_users', JSON.stringify(updatedUsers))
      
      // Generar token simple
      const token = `token_${user.id}_${Date.now()}`
      
      localStorage.setItem('admin_token', token)
      localStorage.setItem('current_admin', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }))
      
      setIsAdmin(true)
      setAdminData({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role
      })
      
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
    localStorage.removeItem('current_admin')
    setIsAdmin(false)
    setAdminData(null)
  }

  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('admin_token')
      const currentAdmin = localStorage.getItem('current_admin')
      
      if (!token || !currentAdmin) return false
      
      // Verificar que el usuario siga existiendo y activo
      const savedUsers = localStorage.getItem('admin_users')
      if (!savedUsers) return false
      
      const users = JSON.parse(savedUsers)
      const adminData = JSON.parse(currentAdmin)
      
      const user = users.find(u => 
        u.id === adminData.id && 
        u.is_active === true
      )
      
      if (!user) {
        // Usuario no existe o está inactivo, limpiar sesión
        localStorage.removeItem('admin_token')
        localStorage.removeItem('current_admin')
        return false
      }
      
      setIsAdmin(true)
      setAdminData({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role
      })
      
      return true
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