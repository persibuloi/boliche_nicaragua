import React from 'react'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, CircleDot } from 'lucide-react'

interface FooterProps {
  onSectionChange?: (section: string) => void
}

export function Footer({ onSectionChange }: FooterProps) {
  return (
    <footer className="bg-bowling-black-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-bowling-orange-500 to-bowling-blue-500 rounded-full flex items-center justify-center">
                <CircleDot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Boliche Nicaragua</h3>
                <p className="text-gray-300">Comunidad de Bowling</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              La comunidad de bowling más grande de Nicaragua. Únete a nuestros torneos y mejora tu juego junto a otros apasionados del bowling.
            </p>
            {/* Redes sociales */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/boliche-nicaragua"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-bowling-blue-500 rounded-full flex items-center justify-center hover:bg-bowling-blue-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/bolichenica"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:from-pink-600 hover:to-purple-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@boliche-nicaragua"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-bowling-orange-500">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-bowling-blue-500" />
                <span className="text-gray-300">info@boliche-nicaragua.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-bowling-blue-500" />
                <span className="text-gray-300">+505 2222-3333</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-bowling-blue-500" />
                <span className="text-gray-300">Managua, Nicaragua</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-bowling-orange-500">Enlaces Rápidos</h4>
            <div className="space-y-2">
              <button 
                onClick={() => onSectionChange?.('inicio')}
                className="block text-left text-gray-300 hover:text-bowling-orange-500 transition-colors cursor-pointer"
              >
                Inicio
              </button>
              <button 
                onClick={() => onSectionChange?.('videos')}
                className="block text-left text-gray-300 hover:text-bowling-orange-500 transition-colors cursor-pointer"
              >
                Videos
              </button>
              <button 
                onClick={() => onSectionChange?.('estadisticas')}
                className="block text-left text-gray-300 hover:text-bowling-orange-500 transition-colors cursor-pointer"
              >
                Estadísticas
              </button>
              <button 
                onClick={() => onSectionChange?.('contacto')}
                className="block text-left text-gray-300 hover:text-bowling-orange-500 transition-colors cursor-pointer"
              >
                Contacto
              </button>
              <button 
                onClick={() => onSectionChange?.('podcast')}
                className="block text-left text-gray-300 hover:text-bowling-orange-500 transition-colors cursor-pointer"
              >
                Podcast
              </button>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Boliche Nicaragua. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desarrollado por Marco Vasquez para la comunidad de boliche
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}