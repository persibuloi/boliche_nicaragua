import React, { useState, useEffect, useRef } from 'react'
import { supabase, Podcast } from '@/lib/supabase'
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Calendar, Clock } from 'lucide-react'

export function PodcastSection() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetchPodcasts()
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentPodcast])

  const fetchPodcasts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('is_published', true)
        .order('publish_date', { ascending: false })

      if (error) throw error
      setPodcasts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar podcasts')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = (podcast?: Podcast) => {
    const audio = audioRef.current
    if (!audio) return

    if (podcast && podcast.id !== currentPodcast?.id) {
      setCurrentPodcast(podcast)
      audio.src = podcast.audio_file_url
      audio.load()
      audio.play()
      setIsPlaying(true)
    } else if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    
    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    const newVolume = parseFloat(e.target.value)
    
    if (audio) {
      audio.volume = newVolume
    }
    setVolume(newVolume)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-bowling-orange-50 to-bowling-black-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Podcast</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-bowling-orange-50 to-bowling-black-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Podcast</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escucha nuestros episodios de podcast sobre bowling, entrevistas y consejos de expertos
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="/images/podcast-studio.jpg"
              alt="Estudio de podcast"
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4 opacity-50"
            />
            <p className="text-gray-600">No hay episodios de podcast disponibles en este momento.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Audio Player */}
            <audio ref={audioRef} preload="metadata" />
            
            {/* Current Playing */}
            {currentPodcast && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="/images/podcast-studio.jpg"
                    alt="Podcast"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-bowling-black-900">{currentPodcast.title}</h3>
                    <p className="text-sm text-gray-600">
                      Episodio {currentPodcast.episode_number} • {new Date(currentPodcast.publish_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                
                {/* Player Controls */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSeek({ target: { value: Math.max(0, currentTime - 15).toString() } } as any)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handlePlayPause()}
                      className="w-12 h-12 bg-bowling-orange-500 hover:bg-bowling-orange-600 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    
                    <button
                      onClick={() => handleSeek({ target: { value: Math.min(duration, currentTime + 15).toString() } } as any)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-2 ml-auto">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Episodes List */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-bowling-black-900 mb-6">Todos los episodios</h3>
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl ${
                    currentPodcast?.id === podcast.id ? 'ring-2 ring-bowling-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src="/images/podcast-studio.jpg"
                      alt="Podcast"
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-bowling-black-900 mb-1">
                            {podcast.title}
                          </h4>
                          {podcast.episode_number && (
                            <span className="inline-block bg-bowling-orange-100 text-bowling-orange-800 text-xs px-2 py-1 rounded-full mb-2">
                              Episodio {podcast.episode_number}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handlePlayPause(podcast)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                              currentPodcast?.id === podcast.id && isPlaying
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-bowling-orange-500 hover:bg-bowling-orange-600'
                            }`}
                          >
                            {currentPodcast?.id === podcast.id && isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" />
                            )}
                          </button>
                          
                          <a
                            href={podcast.audio_file_url}
                            download
                            className="p-2 rounded-full bg-bowling-blue-100 text-bowling-blue-600 hover:bg-bowling-blue-200 transition-colors"
                            title="Descargar episodio"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      
                      {podcast.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{podcast.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(podcast.publish_date).toLocaleDateString('es-ES')}
                        </div>
                        {podcast.duration > 0 && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(podcast.duration)}
                          </div>
                        )}
                        {podcast.file_size && (
                          <span>{formatFileSize(podcast.file_size)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}