import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, MapPin, Mail, Phone, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { validateFormData, generateCSRFToken, validateCSRFToken, checkRateLimit } from '@/utils/security'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  message?: string
}

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    formType: 'general'
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'security' | null
    message: string
  }>({ type: null, message: '' })

  // Generar token CSRF al montar el componente
  useEffect(() => {
    const token = generateCSRFToken()
    setCsrfToken(token)
    // Almacenar en sessionStorage para validación
    sessionStorage.setItem('csrf_token', token)
  }, [])

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'El email es obligatorio'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Ingresa un email válido'
    return undefined
  }

  const validateName = (name: string): string | undefined => {
    if (!name) return 'El nombre es obligatorio'
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (name.length > 50) return 'El nombre no puede exceder 50 caracteres'
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (phone && phone.length > 0) {
      const phoneRegex = /^[+]?[0-9\s\-()]{8,15}$/
      if (!phoneRegex.test(phone)) return 'Ingresa un número de teléfono válido'
    }
    return undefined
  }

  const validateMessage = (message: string): string | undefined => {
    if (!message) return 'El mensaje es obligatorio'
    if (message.length < 10) return 'El mensaje debe tener al menos 10 caracteres'
    if (message.length > 1000) return 'El mensaje no puede exceder 1000 caracteres'
    return undefined
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name': return validateName(value)
      case 'email': return validateEmail(value)
      case 'phone': return validatePhone(value)
      case 'message': return validateMessage(value)
      default: return undefined
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }

    // Clear submit status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar rate limiting
    const userIdentifier = `${formData.email}_${Date.now().toString().slice(0, -5)}` // 5 min window
    if (!checkRateLimit(userIdentifier, 3, 15 * 60 * 1000)) { // 3 requests per 15 minutes
      setSubmitStatus({
        type: 'security',
        message: 'Demasiadas solicitudes. Por favor, espera 15 minutos antes de intentar nuevamente.'
      })
      return
    }

    // Validar token CSRF
    const storedToken = sessionStorage.getItem('csrf_token')
    if (!validateCSRFToken(csrfToken, storedToken || '')) {
      setSubmitStatus({
        type: 'security',
        message: 'Error de seguridad. Por favor, recarga la página e intenta nuevamente.'
      })
      return
    }

    // Mark all fields as touched
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      message: true
    }
    setTouched(allTouched)

    // Validación del lado del servidor
    const serverValidation = validateFormData(formData)
    
    if (!serverValidation.isValid) {
      setErrors(serverValidation.errors as FormErrors)
      setSubmitStatus({
        type: 'error',
        message: 'Por favor, corrige los errores antes de enviar el formulario.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      // Usar datos sanitizados del servidor
      const { data, error } = await supabase.functions.invoke('contact-form-submit', {
        body: {
          ...serverValidation.sanitizedData,
          csrfToken,
          timestamp: Date.now()
        }
      })

      if (error) throw error

      setSubmitStatus({
        type: 'success',
        message: '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.'
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        formType: 'general'
      })
      
      // Reset validation states
      setErrors({})
      setTouched({})
      
      // Generar nuevo token CSRF
      const newToken = generateCSRFToken()
      setCsrfToken(newToken)
      sessionStorage.setItem('csrf_token', newToken)
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Error al enviar el mensaje. Por favor, intenta nuevamente.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-bowling-black-50 to-bowling-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Contacto</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¿Listo para unirte a nuestra comunidad? Contáctanos para inscribirte en torneos o obtener más información
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-bowling-black-900 mb-6">Envíanos un mensaje</h3>
            
            {submitStatus.type && (
              <div className={`p-4 rounded-lg mb-6 flex items-center ${
                submitStatus.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : submitStatus.type === 'security'
                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : submitStatus.type === 'security' ? (
                  <Shield className="w-5 h-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{submitStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-bowling-black-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.name && touched.name
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-bowling-orange-500'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-bowling-black-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-bowling-orange-500'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-bowling-black-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                      errors.phone && touched.phone
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-bowling-orange-500'
                    }`}
                    placeholder="+505 1234-5678"
                  />
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="formType" className="block text-sm font-medium text-bowling-black-700 mb-2">
                    Tipo de consulta
                  </label>
                  <select
                    id="formType"
                    name="formType"
                    value={formData.formType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent transition-colors"
                  >
                    <option value="general">Consulta general</option>
                    <option value="torneo">Inscripción a torneo</option>
                    <option value="clases">Clases de bowling</option>
                    <option value="eventos">Eventos privados</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-bowling-black-700 mb-2">
                  Mensaje * 
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.message.length}/1000 caracteres)
                  </span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none ${
                    errors.message && touched.message
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-gray-300 focus:ring-bowling-orange-500'
                  }`}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  maxLength={1000}
                ></textarea>
                {errors.message && touched.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-bowling-orange-500 hover:bg-bowling-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-bowling-black-900 mb-6">Información de contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-bowling-orange-500 rounded-full flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-bowling-black-900">Ubicación</p>
                    <p className="text-gray-600">Managua, Nicaragua</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-bowling-blue-500 rounded-full flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-bowling-black-900">Email</p>
                    <p className="text-gray-600">info@boliche-nicaragua.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-bowling-black-900">Teléfono</p>
                    <p className="text-gray-600">+505 2222-3333</p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  )
}