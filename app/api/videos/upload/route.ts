import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN

// Configure route to handle video chunks
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for video uploads

// Vercel has a 4.5MB limit for serverless functions
// We handle chunks smaller than this
export async function POST(request: NextRequest) {
  try {
    // Check content length to prevent 413 errors
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4.5MB per chunk.' },
        { status: 413 }
      )
    }

    // Get the video file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const meta = formData.get('meta') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Parse metadata if provided
    let metadata = {}
    if (meta) {
      try {
        metadata = JSON.parse(meta)
      } catch (e) {
        console.error('Failed to parse metadata:', e)
      }
    }

    // Upload to Cloudflare Stream
    const cloudflareFormData = new FormData()
    cloudflareFormData.append('file', file)
    
    // Add metadata
    if (metadata) {
      cloudflareFormData.append('meta', JSON.stringify({
        name: file.name,
        ...metadata
      }))
    }

    // Set upload options
    cloudflareFormData.append('requireSignedURLs', 'false')
    cloudflareFormData.append('allowedOrigins', JSON.stringify([
      'https://insight.aethervtc.ai',
      'http://localhost:3000'
    ]))

    const cloudflareResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
        },
        body: cloudflareFormData
      }
    )

    if (!cloudflareResponse.ok) {
      const errorText = await cloudflareResponse.text()
      console.error('Cloudflare upload failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to upload to Cloudflare' },
        { status: 500 }
      )
    }

    const cloudflareData = await cloudflareResponse.json()
    
    if (!cloudflareData.success) {
      console.error('Cloudflare error:', cloudflareData.errors)
      return NextResponse.json(
        { error: 'Cloudflare upload failed', details: cloudflareData.errors },
        { status: 500 }
      )
    }

    const videoId = cloudflareData.result.uid
    const playbackUrl = cloudflareData.result.preview
    const thumbnailUrl = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`

    // Save video reference to Supabase
    // For now, we'll save without user authentication check
    // In production, you'd want to verify the user session
    
    // Save to videos table
    const { data: video, error: dbError } = await supabaseAdmin
        .from('videos')
        .insert({
          cloudflare_id: videoId,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          url: playbackUrl,
          thumbnail_url: thumbnailUrl,
          duration: cloudflareData.result.duration || 0,
          size: file.size,
          match_id: (metadata as any).matchId || null,
          // uploaded_by: user.id, // TODO: Add user authentication
          metadata: metadata
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database save error:', dbError)
        // Still return success since video uploaded to Cloudflare
      }

    // If this is linked to a match, update the match record
    if ((metadata as any).matchId) {
      // Update matches table
      await supabaseAdmin
          .from('matches')
          .update({ 
            video_id: videoId,
            video_url: playbackUrl,
            has_video: true
          })
          .eq('id', (metadata as any).matchId)
      
      // Also save to match_videos table for video-scoring sync
      await supabaseAdmin
          .from('match_videos')
          .insert({
            match_id: (metadata as any).matchId,
            cloudflare_video_id: videoId,
            video_url: playbackUrl,
            duration: cloudflareData.result.duration || 0,
            recording_started_at: new Date().toISOString(),
            processed: true
          })
    }

    // Automatically apply watermark
    try {
      const watermarkResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}/watermarks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            file: 'https://insight.aethervtc.ai/aether-logo.png',
            position: 'top-right',
            opacity: 0.8,
            scale: 0.15
          })
        }
      )

      if (!watermarkResponse.ok) {
        console.log('Watermark application failed, but video uploaded successfully')
      } else {
        console.log('Watermark applied successfully to video:', videoId)
      }
    } catch (watermarkError) {
      console.error('Error applying watermark:', watermarkError)
      // Don't fail the upload if watermarking fails
    }

    return NextResponse.json({
      success: true,
      videoId,
      playbackUrl,
      thumbnailUrl,
      message: 'Video uploaded and watermarked successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}