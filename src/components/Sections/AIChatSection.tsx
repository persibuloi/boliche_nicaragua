import React, { useState, useRef, useEffect } from 'react'
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  MessageCircle,
  Sparkles,
  Database,
  TrendingUp,
  Trophy,
  Target
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'text' | 'data' | 'stats'
}

const AIChatSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy el asistente IA de Boliche Nicaragua 🎳. Puedo ayudarte con estadísticas, información de jugadores, torneos y mucho más. ¿En qué puedo ayudarte?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simular respuesta de IA (aquí se conectaría al webhook)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase()
    
    if (input.includes('estadística') || input.includes('promedio') || input.includes('puntaje')) {
      return {
        id: Date.now().toString(),
        content: 'Aquí tienes las estadísticas más recientes:\n\n📊 **Promedio General**: 165.4\n🎯 **Juegos Perfectos**: 8 registrados\n🏆 **Torneos Activos**: 15+\n👥 **Jugadores Activos**: 80+\n\n¿Te gustaría ver estadísticas específicas de algún jugador?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'stats'
      }
    }
    
    if (input.includes('torneo') || input.includes('competencia')) {
      return {
        id: Date.now().toString(),
        content: 'Información sobre torneos:\n\n🏆 **Próximo Torneo**: Campeonato de Primavera\n📅 **Fecha**: 15-17 Marzo 2024\n📍 **Ubicación**: Centro de Boliche Nacional\n👥 **Participantes**: 32 jugadores registrados\n\n¿Quieres registrarte o ver más detalles?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'data'
      }
    }
    
    if (input.includes('jugador') || input.includes('perfil')) {
      return {
        id: Date.now().toString(),
        content: 'Puedo ayudarte con información de jugadores:\n\n🔍 **Búsqueda disponible**:\n• Promedios y estadísticas\n• Historial de torneos\n• Logros y récords\n• Comparación entre jugadores\n\n¿De qué jugador te gustaría saber más?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
    }
    
    return {
      id: Date.now().toString(),
      content: 'Entiendo tu consulta. Puedo ayudarte con:\n\n📊 **Estadísticas** - Promedios, puntajes, análisis\n🏆 **Torneos** - Información y registros\n👥 **Jugadores** - Perfiles y logros\n🎯 **Logros** - Juegos perfectos y récords\n📈 **Análisis** - Tendencias y comparaciones\n\n¿Sobre qué tema específico te gustaría saber más?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'stats': return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'data': return <Database className="w-4 h-4 text-green-500" />
      default: return <Sparkles className="w-4 h-4 text-purple-500" />
    }
  }

  const quickActions = [
    { label: 'Ver Estadísticas', icon: TrendingUp, query: 'Muéstrame las estadísticas generales' },
    { label: 'Próximos Torneos', icon: Trophy, query: 'Información sobre próximos torneos' },
    { label: 'Top Jugadores', icon: Target, query: 'Quiénes son los mejores jugadores' },
    { label: 'Juegos Perfectos', icon: Sparkles, query: 'Información sobre juegos perfectos' }
  ]

  const handleQuickAction = (query: string) => {
    setInputMessage(query)
    setTimeout(() => handleSendMessage(), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bowling-blue-50 to-bowling-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Asistente IA
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Tu asistente inteligente para consultas sobre estadísticas, torneos y jugadores de Boliche Nicaragua
          </p>
          <p className="text-sm text-gray-500 italic">
            Elaborado por <span className="font-semibold text-purple-600">Marco Vásquez</span>, Especialista en Inteligencia Artificial
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.query)}
              className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              <action.icon className="w-8 h-8 mx-auto mb-2 text-bowling-orange-600" />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Chat con IA</h3>
                <p className="text-white/80 text-sm">Conectado a la base de datos</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-bowling-orange-500' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-bowling-orange-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === 'ai' && getMessageIcon(message.type)}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">Escribiendo...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3 rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Presiona Enter para enviar • Conectado a la base de datos de Boliche Nicaragua
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center">
              IA desarrollada por <span className="font-medium text-purple-500">Marco Vásquez</span> - Especialista en Inteligencia Artificial
            </p>
          </div>
        </div>

        {/* Features Info */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Database className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Base de Datos</h3>
            <p className="text-gray-600 text-sm">
              Conectado directamente a Airtable para información en tiempo real
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">IA Avanzada</h3>
            <p className="text-gray-600 text-sm">
              Automatización con agentes inteligentes vía webhook
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Análisis</h3>
            <p className="text-gray-600 text-sm">
              Estadísticas y análisis inteligente de rendimiento
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChatSection
