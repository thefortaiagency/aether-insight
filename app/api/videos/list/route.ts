import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    if (!accountId || !token) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      )
    }

    // Fetch videos from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Format the videos for the frontend
    const videos = data.result?.map((video: any) => ({
      id: video.uid,
      title: video.meta?.name || `Match Recording ${new Date(video.created).toLocaleDateString()}`,
      duration: video.duration ? formatDuration(video.duration) : 'Processing...',
      date: new Date(video.created).toLocaleDateString(),
      description: video.meta?.matchId ? `Match ID: ${video.meta.matchId}` : 'Wrestling match recording',
      thumbnail: video.thumbnail,
      ready: video.readyToStream,
      playbackUrl: video.playback?.hls || null,
      downloadUrl: video.playback?.dash || null,
      meta: video.meta || {}
    })) || []

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}