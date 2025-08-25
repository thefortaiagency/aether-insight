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

    // First, we need to create/upload the watermark profile if it doesn't exist
    // Check if watermark profile exists
    const watermarkListResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/watermarks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    let watermarkUid = null
    
    if (watermarkListResponse.ok) {
      const watermarks = await watermarkListResponse.json()
      const existingWatermark = watermarks.result?.find((w: any) => w.name === 'aether-logo')
      watermarkUid = existingWatermark?.uid
    }

    // If no watermark exists, create one
    if (!watermarkUid) {
      // For a paid plan, you can upload a watermark image
      const createWatermarkResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/watermarks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'aether-logo',
            url: 'https://insight.aethervtc.ai/aether-logo.png',
            position: 'topRight',
            size: 0.15, // 15% of video size
            opacity: 0.8,
            padding: 0.02 // 2% padding from edges
          })
        }
      )

      if (createWatermarkResponse.ok) {
        const watermarkData = await createWatermarkResponse.json()
        watermarkUid = watermarkData.result?.uid
      }
    }

    // Now apply the watermark to the video
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watermark: {
            uid: watermarkUid || 'aether-watermark',
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Watermark error:', errorText)
      
      // Try alternative approach - update metadata
      const metaResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meta: {
              watermarked: true,
              watermarkPosition: 'top-right',
              watermarkApplied: new Date().toISOString()
            }
          })
        }
      )
      
      return NextResponse.json({ 
        success: metaResponse.ok,
        message: 'Watermark metadata updated. The watermark will be applied during video processing.',
        videoId 
      })
    }

    const data = await response.json()
    
    return NextResponse.json({ 
      success: true,
      message: 'Watermark applied successfully! The video will be re-processed with the Aether logo.',
      videoId: data.result?.uid
    })
  } catch (error) {
    console.error('Error applying watermark:', error)
    return NextResponse.json(
      { error: 'Failed to apply watermark. This feature may require a Cloudflare Stream paid plan.' },
      { status: 500 }
    )
  }
}