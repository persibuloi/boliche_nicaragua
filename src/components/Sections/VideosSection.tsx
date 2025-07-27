import React, { useState, useEffect } from 'react'
import { supabase, YoutubeVideo } from '@/lib/supabase'
import { Play, ExternalLink, Calendar } from 'lucide-react'
import ReactPlayer from 'react-player'

export function VideosSection() {
  const [videos, setVideos] = useState<YoutubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<YoutubeVideo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setVideos(data || [])
      if (data && data.length > 0) {
        setSelectedVideo(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar videos')
    } finally {
      setLoading(false)
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : ''
  }

  const getThumbnailUrl = (url: string) => {
    const videoId = extractVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '/images/bowling-tournament.jpg'
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-bowling-black-50 to-bowling-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Videos</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bowling-orange-500"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-bowling-black-50 to-bowling-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Videos</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-bowling-black-50 to-bowling-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-bowling-black-900 mb-4">Videos</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-bowling-orange-500 to-bowling-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Disfruta de los mejores momentos de nuestros torneos y aprende nuevas técnicas
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay videos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main video player */}
            <div className="lg:col-span-2">
              {selectedVideo && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractVideoId(selectedVideo.youtube_url)}`}
                      title={selectedVideo.title}
                      className="w-full h-full rounded-t-xl"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-bowling-black-900 mb-3">
                      {selectedVideo.title}
                    </h3>
                    {selectedVideo.description && (
                      <p className="text-gray-600 mb-4">{selectedVideo.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(selectedVideo.created_at).toLocaleDateString('es-ES')}
                      </div>
                      <a
                        href={selectedVideo.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-bowling-blue-500 hover:text-bowling-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver en YouTube
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video list */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-bowling-black-900 mb-4">Más Videos</h3>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedVideo?.id === video.id
                        ? 'ring-2 ring-bowling-orange-500 shadow-lg'
                        : 'hover:shadow-md hover:scale-105'
                    }`}
                  >
                    <div className="bg-white p-3">
                      <div className="flex space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getThumbnailUrl(video.youtube_url)}
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-bowling-black-900 truncate">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(video.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}