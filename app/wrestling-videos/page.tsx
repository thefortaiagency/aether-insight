'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Following Cloudflare Stream best practices - disable SSR for video player
const CloudflarePlayer = dynamic(() => import('@/components/cloudflare-player'), { 
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
      <p className="text-gray-400">Loading player...</p>
    </div>
  )
})
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, ExternalLink, Play, Video, Loader2, RefreshCw, AlertCircle, Trash2, Droplets } from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

interface VideoData {
  id: string
  title: string
  duration: string
  date: string
  description: string
  thumbnail?: string
  ready: boolean
  playbackUrl?: string
  downloadUrl?: string
  meta?: any
}

export default function WrestlingVideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null)
  const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null)
  const [applyingWatermark, setApplyingWatermark] = useState<string | null>(null)

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/videos/list')
      if (!response.ok) throw new Error('Failed to fetch videos')
      
      const data = await response.json()
      setVideos(data.videos || [])
      
      // Auto-select first video if available
      if (data.videos && data.videos.length > 0 && !selectedVideo) {
        setSelectedVideo(data.videos[0])
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError('Failed to load videos. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This cannot be undone.')) {
      return
    }

    setDeletingVideo(videoId)
    try {
      const response = await fetch(`/api/videos/delete?id=${videoId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete video')

      // Remove from local state
      setVideos(videos.filter(v => v.id !== videoId))
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null)
      }

      // Show success (you could add a toast here)
      alert('Video deleted successfully')
    } catch (err) {
      console.error('Error deleting video:', err)
      alert('Failed to delete video')
    } finally {
      setDeletingVideo(null)
    }
  }

  const handleDownload = async (video: VideoData) => {
    setDownloadingVideo(video.id)
    try {
      const response = await fetch('/api/videos/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id })
      })

      if (!response.ok) throw new Error('Failed to get download URL')

      const data = await response.json()
      
      // Create a temporary link and click it to start download
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = `${video.title || 'video'}.mp4`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading video:', err)
      alert('Failed to download video. The video may still be processing.')
    } finally {
      setDownloadingVideo(null)
    }
  }

  const handleWatermark = async (videoId: string) => {
    setApplyingWatermark(videoId)
    try {
      const response = await fetch('/api/videos/watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      })

      if (!response.ok) throw new Error('Failed to apply watermark')

      const data = await response.json()
      
      if (data.warning) {
        alert(data.warning)
      } else {
        alert('Watermark applied successfully! The video will be re-processed.')
        // Refresh the video list to see updated status
        await fetchVideos()
      }
    } catch (err) {
      console.error('Error applying watermark:', err)
      alert('Failed to apply watermark. This feature may require a Cloudflare Stream paid plan.')
    } finally {
      setApplyingWatermark(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative">
      <WrestlingStatsBackground />
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#D4AF38]">Wrestling Videos</h1>
              <p className="text-gray-200">Video Analysis Platform</p>
            </div>
            <Button
              onClick={fetchVideos}
              variant="outline"
              className="border-[#D4AF38] text-[#D4AF38]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-4 border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video List */}
          <div className="lg:col-span-1">
            <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-[#D4AF38]">
                  Videos {videos.length > 0 && `(${videos.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D4AF38] mx-auto" />
                    <p className="text-gray-400 mt-2">Loading videos...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-8 w-8 text-gray-500 mx-auto" />
                    <p className="text-gray-400 mt-2">No videos uploaded yet</p>
                  </div>
                ) : (
                  videos.map(video => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedVideo?.id === video.id
                          ? 'bg-[#D4AF38]/20 border border-[#D4AF38]'
                          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Video className="h-4 w-4 text-[#D4AF38] mt-1" />
                        <div className="flex items-center gap-1">
                          {!video.ready && (
                            <Badge className="bg-yellow-600 text-xs">Processing</Badge>
                          )}
                          <span className="text-xs text-gray-400">{video.duration}</span>
                        </div>
                      </div>
                      <p className="text-white font-medium mt-1">{video.title}</p>
                      <p className="text-xs text-gray-400">{video.date}</p>
                      {video.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{video.description}</p>
                      )}
                      {/* Delete button */}
                      <div className="mt-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-red-500 hover:bg-red-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(video.id)
                          }}
                          disabled={deletingVideo === video.id}
                        >
                          {deletingVideo === video.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          <span className="ml-1 text-xs">Delete</span>
                        </Button>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-3 space-y-4">
            {selectedVideo ? (
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedVideo.title}</CardTitle>
                    <Badge className={selectedVideo.ready ? "bg-green-600" : "bg-yellow-600"}>
                      {selectedVideo.ready ? 'Ready' : 'Processing'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedVideo.ready ? (
                    <>
                      <CloudflarePlayer videoId={selectedVideo.id} />
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <a
                          href={`https://customer-gozi8qaaq1gycqie.cloudflarestream.com/${selectedVideo.id}/watch`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="w-full bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Full Player
                          </Button>
                        </a>
                        <Button 
                          onClick={() => handleDownload(selectedVideo)}
                          disabled={downloadingVideo === selectedVideo.id}
                          variant="outline"
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-600/10"
                        >
                          {downloadingVideo === selectedVideo.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download MP4
                        </Button>
                        <Button 
                          onClick={() => handleWatermark(selectedVideo.id)}
                          disabled={applyingWatermark === selectedVideo.id}
                          variant="outline"
                          className="w-full border-[#D4AF38] text-[#D4AF38] hover:bg-[#D4AF38]/10"
                        >
                          {applyingWatermark === selectedVideo.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Droplets className="h-4 w-4 mr-2" />
                          )}
                          Add Watermark
                        </Button>
                        <Button 
                          onClick={() => handleDelete(selectedVideo.id)}
                          disabled={deletingVideo === selectedVideo.id}
                          variant="outline"
                          className="w-full border-red-600 text-red-600 hover:bg-red-600/10"
                        >
                          {deletingVideo === selectedVideo.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete Video
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-[#D4AF38] mx-auto mb-4" />
                        <p className="text-white">Video is processing...</p>
                        <p className="text-gray-400 text-sm mt-2">This may take a few minutes</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Details */}
                  <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                    <h3 className="text-[#D4AF38] font-semibold mb-2">Video Details</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-500">Duration:</span> {selectedVideo.duration}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Uploaded:</span> {selectedVideo.date}
                      </p>
                      {selectedVideo.description && (
                        <p className="text-gray-300">
                          <span className="text-gray-500">Description:</span> {selectedVideo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardContent className="py-16">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Select a video to play</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Details (only show when video is selected and ready) */}
            {selectedVideo && selectedVideo.ready && (
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardHeader>
                  <CardTitle className="text-[#D4AF38]">Technical Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Video ID</p>
                      <p className="text-white font-mono text-xs">{selectedVideo.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">HLS Stream</p>
                      <p className="text-white text-xs break-all">
                        https://customer-gozi8qaaq1gycqie.cloudflarestream.com/{selectedVideo.id}/manifest/video.m3u8
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">DASH Stream</p>
                      <p className="text-white text-xs break-all">
                        https://customer-gozi8qaaq1gycqie.cloudflarestream.com/{selectedVideo.id}/manifest/video.mpd
                      </p>
                    </div>
                    <div className="p-3 bg-green-900/20 border border-green-600/30 rounded">
                      <p className="text-sm text-green-500">
                        ✅ Video streaming from Cloudflare Stream
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}