import { NextRequest, NextResponse } from 'next/server'

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { matchId, fileName } = await request.json()
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_TOKEN) {
      return NextResponse.json(
        { error: 'Cloudflare Stream not configured' },
        { status: 500 }
      )
    }
    
    // Request a direct upload URL from Cloudflare
    // This allows client-side upload of any size video
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600, // 1 hour max
          requireSignedURLs: false
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Cloudflare direct upload error:', error)
      return NextResponse.json(
        { error: 'Failed to get upload URL' },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('Cloudflare error:', data.errors)
      return NextResponse.json(
        { error: 'Failed to get upload URL', details: data.errors },
        { status: 500 }
      )
    }
    
    // Return the upload URL and video ID
    // Use videodelivery.net for playback URLs
    const videoId = data.result.uid
    const streamURL = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`
    const playbackURL = `https://videodelivery.net/${videoId}/manifest/video.m3u8`
    const thumbnailURL = `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`
    
    return NextResponse.json({
      success: true,
      uploadURL: data.result.uploadURL,
      videoId: videoId,
      streamURL: playbackURL,  // Use videodelivery.net for playback
      thumbnailURL: thumbnailURL
    })
    
  } catch (error) {
    console.error('Error getting upload URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'