import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  is_active: boolean
  created_at: string
  last_login?: string
}

interface UserManagementProps {
  currentUser: any
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor'
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    try {
      const savedUsers = localStorage.getItem('admin_users')
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers))
      } else {
        // Inicializar con usuario por defecto
        const defaultUsers: AdminUser[] = [
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
        setUsers(defaultUsers)
        localStorage.setItem('admin_users', JSON.stringify(defaultUsers))
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setMessage({ type: 'error', text: 'Error al cargar usuarios' })
    }
  }

  const saveUsers = (updatedUsers: AdminUser[]) => {
    setUsers(updatedUsers)
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers))
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (newUserForm.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    // Verificar si el email ya existe
    if (users.some(user => user.email === newUserForm.email)) {
      setMessage({ type: 'error', text: 'Ya existe un usuario con este email' })
      return
    }

    try {
      setLoading(true)
      
      const newUser: AdminUser = {
        id: Date.now().toString(),
        name: newUserForm.name,
        email: newUserForm.email,
        password: newUserForm.password,
        role: newUserForm.role,
        is_active: true,
        created_at: new Date().toISOString()
      }

      const updatedUsers = [...users, newUser]
      saveUsers(updatedUsers)

      setMessage({ type: 'success', text: 'Usuario creado exitosamente' })
      setNewUserForm({ name: '', email: '', password: '', role: 'editor' })
      setShowAddUser(false)
    } catch (error) {
      console.error('Error creating user:', error)
      setMessage({ type: 'error', text: 'Error al crear usuario' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      return
    }

    try {
      setLoading(true)
      
      // Encontrar el usuario actual por email
      const currentUserEmail = currentUser?.email || 'admin@boliche-nicaragua.com'
      const userIndex = users.findIndex(user => user.email === currentUserEmail)
      
      if (userIndex === -1) {
        setMessage({ type: 'error', text: 'Usuario no encontrado' })
        return
      }

      // Verificar contraseña actual
      if (users[userIndex].password !== passwordForm.currentPassword) {
        setMessage({ type: 'error', text: 'La contraseña actual es incorrecta' })
        return
      }

      // Actualizar contraseña
      const updatedUsers = [...users]
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        password: passwordForm.newPassword
      }
      
      saveUsers(updatedUsers)

      setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePassword(false)
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: 'Error al cambiar contraseña. Verifica tu contraseña actual.' })
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = (user: AdminUser) => {
    try {
      setLoading(true)
      
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, is_active: !u.is_active }
          : u
      )
      
      saveUsers(updatedUsers)

      setMessage({ 
        type: 'success', 
        text: `Usuario ${user.is_active ? 'desactivado' : 'activado'} exitosamente` 
      })
    } catch (error) {
      console.error('Error toggling user status:', error)
      setMessage({ type: 'error', text: 'Error al cambiar estado del usuario' })
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = (user: AdminUser) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${user.name}?`)) return

    try {
      setLoading(true)
      
      const updatedUsers = users.filter(u => u.id !== user.id)
      saveUsers(updatedUsers)

      setMessage({ type: 'success', text: 'Usuario eliminado exitosamente' })
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage({ type: 'error', text: 'Error al eliminar usuario' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <div className="space-x-3">
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Key className="w-4 h-4 mr-2" />
            Cambiar Contraseña
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Usuario
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-current hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Usuarios del Sistema</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Editor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('es-ES')
                      : 'Nunca'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      disabled={user.id === currentUser?.id}
                      className={`${
                        user.is_active 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={user.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => deleteUser(user)}
                        className="text-red-600 hover:text-red-900 ml-4"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Agregar Nuevo Usuario</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Cambiar Contraseña</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
