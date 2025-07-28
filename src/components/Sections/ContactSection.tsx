import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, MapPin, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    formType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Por favor, completa todos los campos obligatorios.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const { data, error } = await supabase.functions.invoke('contact-form-submit', {
        body: formData
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
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                {submitStatus.message}
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
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-bowling-black-700 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-bowling-black-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent transition-colors"
                    placeholder="+505 xxxx-xxxx"
                  />
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
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bowling-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                ></textarea>
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