import React, { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { supabase, YoutubeVideo, Podcast, ContactForm } from '@/lib/supabase'
import { 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Eye, 
  EyeOff, 
  Youtube, 
  Mic, 
  Mail,
  CheckCircle,
  ExternalLink,
  X
} from 'lucide-react'

export function AdminDashboard() {
  const { logout, adminData } = useAdmin()
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState<YoutubeVideo[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [contacts, setContacts] = useState<ContactForm[]>([])
  const [loading, setLoading] = useState(false)

  // Video form state
  const [videoForm, setVideoForm] = useState({
    title: '',
    youtube_url: '',
    description: '',
    display_order: 0
  })
  const [editingVideo, setEditingVideo] = useState<YoutubeVideo | null>(null)

  // Podcast upload state
  const [podcastForm, setPodcastForm] = useState({
    title: '',
    description: '',
    episode_number: 0
  })
  const [podcastFile, setPodcastFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (activeTab === 'videos') fetchVideos()
    else if (activeTab === 'podcasts') fetchPodcasts()
    else if (activeTab === 'contacts') fetchContacts()
  }, [activeTab])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('display_order', { ascending: true })
      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPodcasts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPodcasts(data || [])
    } catch (error) {
      console.error('Error fetching podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_forms')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const videoData = {
        ...videoForm,
        is_active: true,
        updated_at: new Date().toISOString()
      }

      if (editingVideo) {
        const { error } = await supabase
          .from('youtube_videos')
          .update(videoData)
          .eq('id', editingVideo.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('youtube_videos')
          .insert([{ ...videoData, created_at: new Date().toISOString() }])
        if (error) throw error
      }

      setVideoForm({ title: '', youtube_url: '', description: '', display_order: 0 })
      setEditingVideo(null)
      fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePodcastUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!podcastFile) return

    try {
      setLoading(true)
      setUploadProgress(0)

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string
          
          const { data, error } = await supabase.functions.invoke('podcast-upload', {
            body: {
              audioData: base64Data,
              fileName: podcastFile.name,
              title: podcastForm.title,
              description: podcastForm.description,
              episodeNumber: podcastForm.episode_number || null,
              duration: 0 // Will be calculated by the browser when loaded
            }
          })

          if (error) throw error

          setPodcastForm({ title: '', description: '', episode_number: 0 })
          setPodcastFile(null)
          fetchPodcasts()
          setUploadProgress(100)
        } catch (error) {
          console.error('Error uploading podcast:', error)
        } finally {
          setLoading(false)
          setTimeout(() => setUploadProgress(0), 2000)
        }
      }
      reader.readAsDataURL(podcastFile)
    } catch (error) {
      console.error('Error preparing upload:', error)
      setLoading(false)
    }
  }

  const toggleVideoStatus = async (video: YoutubeVideo) => {
    try {
      const { error } = await supabase
        .from('youtube_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id)
      if (error) throw error
      fetchVideos()
    } catch (error) {
      console.error('Error updating video status:', error)
    }
  }

  const deleteVideo = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) return
    
    try {
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const markContactAsRead = async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact_forms')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
      fetchContacts()
    } catch (error) {
      console.error('Error updating contact:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Panel de Administración - Boliche Nicaragua
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {adminData?.fullName}
              </span>
              <button
                onClick={logout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Cerrar sesión
              </button>
              {/* Botón de cerrar panel - X */}
              <button
                onClick={logout}
                className="flex items-center justify-center w-10 h-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border border-red-200 hover:border-red-300"
                title="Cerrar panel"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'videos', label: 'Videos de YouTube', icon: Youtube },
              { id: 'podcasts', label: 'Podcasts', icon: Mic },
              { id: 'contacts', label: 'Formularios de Contacto', icon: Mail }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === id
                    ? 'border-bowling-orange-500 text-bowling-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            {/* Add/Edit Video Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingVideo ? 'Editar Video' : 'Agregar Nuevo Video'}
              </h2>
              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del video
                    </label>
                    <input
                      type="text"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden de visualización
                    </label>
                    <input
                      type="number"
                      value={videoForm.display_order}
                      onChange={(e) => setVideoForm({ ...videoForm, display_order: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de YouTube
                  </label>
                  <input
                    type="url"
                    value={videoForm.youtube_url}
                    onChange={(e) => setVideoForm({ ...videoForm, youtube_url: e.target.value })}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {editingVideo ? 'Actualizar' : 'Agregar'} Video
                  </button>
                  {editingVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVideo(null)
                        setVideoForm({ title: '', youtube_url: '', description: '', display_order: 0 })
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Videos List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Videos Existentes</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {videos.map((video) => (
                  <div key={video.id} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{video.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-gray-400">Orden: {video.display_order}</span>
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-bowling-blue-600 hover:text-bowling-blue-800 flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Ver en YouTube
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleVideoStatus(video)}
                        className={`p-2 rounded ${
                          video.is_active ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={video.is_active ? 'Ocultar video' : 'Mostrar video'}
                      >
                        {video.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingVideo(video)
                          setVideoForm({
                            title: video.title,
                            youtube_url: video.youtube_url,
                            description: video.description || '',
                            display_order: video.display_order
                          })
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Podcasts Tab */}
        {activeTab === 'podcasts' && (
          <div className="space-y-8">
            {/* Upload Podcast Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Subir Nuevo Podcast</h2>
              <form onSubmit={handlePodcastUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del episodio
                    </label>
                    <input
                      type="text"
                      value={podcastForm.title}
                      onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de episodio
                    </label>
                    <input
                      type="number"
                      value={podcastForm.episode_number}
                      onChange={(e) => setPodcastForm({ ...podcastForm, episode_number: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={podcastForm.description}
                    onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Archivo de audio (MP3)
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setPodcastFile(e.target.files?.[0] || null)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-bowling-orange-500 focus:border-bowling-orange-500"
                  />
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-bowling-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !podcastFile}
                  className="bg-bowling-orange-500 hover:bg-bowling-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Podcast
                </button>
              </form>
            </div>

            {/* Podcasts List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Podcasts Existentes</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {podcasts.map((podcast) => (
                  <div key={podcast.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {podcast.title}
                          {podcast.episode_number && (
                            <span className="ml-2 text-xs bg-bowling-orange-100 text-bowling-orange-800 px-2 py-1 rounded">
                              Episodio {podcast.episode_number}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{podcast.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400">
                          <span>{new Date(podcast.publish_date).toLocaleDateString('es-ES')}</span>
                          {podcast.file_size && (
                            <span>{(podcast.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          podcast.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {podcast.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Formularios de Contacto</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact.id} className={`p-6 ${
                  !contact.is_read ? 'bg-blue-50' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          contact.form_type === 'torneo' ? 'bg-bowling-orange-100 text-bowling-orange-800' :
                          contact.form_type === 'clases' ? 'bg-bowling-blue-100 text-bowling-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contact.form_type}
                        </span>
                        {!contact.is_read && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Nuevo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Email: {contact.email} | Teléfono: {contact.phone || 'No proporcionado'}
                      </p>
                      <p className="text-sm text-gray-800">{contact.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(contact.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!contact.is_read && (
                        <button
                          onClick={() => markContactAsRead(contact.id)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded" 
                          title="Marcar como leído"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}