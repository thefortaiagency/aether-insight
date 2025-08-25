'use client'

import { useState } from 'react'
import CloudflarePlayer from '@/components/cloudflare-player'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ExternalLink, Play, Video } from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

// Your actual video from Cloudflare
const WRESTLING_VIDEOS = [
  {
    id: '87d0bf0689104ac7a9cdf9aa0c9c31a0',
    title: 'Wrestling Match #1',
    duration: '6:30',
    date: 'August 2025',
    description: 'Recorded wrestling match from the platform'
  }
]

export default function WrestlingVideosPage() {
  const [selectedVideo, setSelectedVideo] = useState(WRESTLING_VIDEOS[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative">
      <WrestlingStatsBackground />
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#D4AF38]">Wrestling Videos</h1>
          <p className="text-gray-200">Video Analysis Platform</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video List */}
          <div className="lg:col-span-1">
            <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-[#D4AF38]">Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {WRESTLING_VIDEOS.map(video => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedVideo.id === video.id
                        ? 'bg-[#D4AF38]/20 border border-[#D4AF38]'
                        : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <Video className="h-4 w-4 text-[#D4AF38] mt-1" />
                      <span className="text-xs text-gray-400">{video.duration}</span>
                    </div>
                    <p className="text-white font-medium mt-1">{video.title}</p>
                    <p className="text-xs text-gray-400">{video.date}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{selectedVideo.title}</CardTitle>
                  <Badge className="bg-green-600">Ready</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CloudflarePlayer videoId={selectedVideo.id} />
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <a
                    href={`https://customer-gozi8qaaq1gycqie.cloudflarestream.com/${selectedVideo.id}/watch`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Full Player
                    </Button>
                  </a>
                  <a
                    href={`https://customer-gozi8qaaq1gycqie.cloudflarestream.com/${selectedVideo.id}/downloads/default.mp4`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600">
                      <Download className="h-4 w-4 mr-2" />
                      Download MP4
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Video Details */}
            <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-[#D4AF38]">Video Information</CardTitle>
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
          </div>
        </div>
      </div>
    </div>
  )
}