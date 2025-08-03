/**
 * Utilidades de seguridad para validación y sanitización
 */

// Sanitización de strings para prevenir XSS
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
    .substring(0, 1000) // Limitar longitud
}

// Sanitización de email
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return ''
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._-]/g, '') // Solo caracteres válidos para email
    .substring(0, 254) // Límite RFC para emails
}

// Sanitización de teléfono
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return ''
  
  return phone
    .replace(/[^0-9+\s\-()]/g, '') // Solo números y caracteres de formato
    .trim()
    .substring(0, 20) // Límite razonable para teléfonos
}

// Validación del lado del servidor
export const validateFormData = (data: {
  name: string
  email: string
  phone?: string
  message: string
  formType: string
}) => {
  const errors: { [key: string]: string } = {}

  // Validar nombre
  const sanitizedName = sanitizeString(data.name)
  if (!sanitizedName) {
    errors.name = 'El nombre es obligatorio'
  } else if (sanitizedName.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (sanitizedName.length > 50) {
    errors.name = 'El nombre no puede exceder 50 caracteres'
  }

  // Validar email
  const sanitizedEmail = sanitizeEmail(data.email)
  if (!sanitizedEmail) {
    errors.email = 'El email es obligatorio'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      errors.email = 'Formato de email inválido'
    }
  }

  // Validar teléfono (opcional)
  if (data.phone) {
    const sanitizedPhone = sanitizePhone(data.phone)
    if (sanitizedPhone.length > 0) {
      const phoneRegex = /^[+]?[0-9\s\-()]{8,15}$/
      if (!phoneRegex.test(sanitizedPhone)) {
        errors.phone = 'Formato de teléfono inválido'
      }
    }
  }

  // Validar mensaje
  const sanitizedMessage = sanitizeString(data.message)
  if (!sanitizedMessage) {
    errors.message = 'El mensaje es obligatorio'
  } else if (sanitizedMessage.length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres'
  } else if (sanitizedMessage.length > 1000) {
    errors.message = 'El mensaje no puede exceder 1000 caracteres'
  }

  // Validar tipo de formulario
  const validFormTypes = ['general', 'torneo', 'clases', 'eventos']
  if (!validFormTypes.includes(data.formType)) {
    errors.formType = 'Tipo de formulario inválido'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      name: sanitizedName,
      email: sanitizedEmail,
      phone: data.phone ? sanitizePhone(data.phone) : '',
      message: sanitizedMessage,
      formType: data.formType
    }
  }
}

// Generar token CSRF simple (para uso básico)
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validar token CSRF
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false
  return token === storedToken
}

// Rate limiting simple (almacenamiento en memoria)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export const checkRateLimit = (identifier: string, maxRequests = 5, windowMs = 15 * 60 * 1000): boolean => {
  const now = Date.now()
  const key = identifier
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Primera solicitud o ventana expirada
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false // Límite excedido
  }
  
  // Incrementar contador
  current.count++
  return true
}

// Limpiar rate limit store periódicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Limpiar cada 5 minutos
