import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CLOUDFLARE_STREAM_TOKEN

    if (!accountId || !token) {
      return NextResponse.json(
        { error: 'Cloudflare credentials not configured' },
        { status: 500 }
      )
    }

    // First, ensure downloads are enabled for this video
    const updateResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          allowedOrigins: ['*'],
          requireSignedURLs: false,
          downloadable: true // Enable downloads
        })
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to enable downloads')
    }

    // Get video details to construct download URL
    const videoResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!videoResponse.ok) {
      throw new Error('Failed to get video details')
    }

    const videoData = await videoResponse.json()
    
    // Construct the download URL
    // Cloudflare Stream provides download URLs in this format
    const subdomain = process.env.CLOUDFLARE_CUSTOMER_SUBDOMAIN || 'gozi8qaaq1gycqie'
    const cleanSubdomain = subdomain.replace('customer-', '').replace('.cloudflarestream.com', '')
    const downloadUrl = `https://customer-${cleanSubdomain}.cloudflarestream.com/${videoId}/downloads/default.mp4`

    return NextResponse.json({ 
      downloadUrl,
      videoInfo: {
        title: videoData.result?.meta?.name || 'video',
        duration: videoData.result?.duration,
        size: videoData.result?.size
      }
    })
  } catch (error) {
    console.error('Error getting download URL:', error)
    return NextResponse.json(
      { error: 'Failed to get download URL' },
      { status: 500 }
    )
  }
}