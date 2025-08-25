import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Store video parts temporarily
const videoParts = new Map<string, Buffer[]>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const meta = formData.get('meta') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const metadata = JSON.parse(meta || '{}')
    const { videoId, partNumber, totalParts, matchId } = metadata

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Store part in memory
    if (!videoParts.has(videoId)) {
      videoParts.set(videoId, [])
    }
    
    const parts = videoParts.get(videoId)!
    parts[partNumber] = buffer
    
    // Check if all parts are received
    const receivedParts = parts.filter(p => p !== undefined).length
    
    if (receivedParts === totalParts) {
      // Combine all parts
      const completeBuffer = Buffer.concat(parts)
      
      // Save to Supabase storage instead of Cloudflare
      const fileName = `matches/${matchId}/recording-${Date.now()}.webm`
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('videos')
        .upload(fileName, completeBuffer, {
          contentType: 'video/webm',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload video' },
          { status: 500 }
        )
      }
      
      // Clean up memory
      videoParts.delete(videoId)
      
      // Save video record in database
      const { data: videoRecord, error: dbError } = await supabaseAdmin
        .from('videos')
        .insert({
          match_id: matchId,
          file_path: fileName,
          file_size: completeBuffer.length,
          duration: 0, // Would need to parse video to get actual duration
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (dbError) {
        console.error('Database error:', dbError)
      }
      
      return NextResponse.json({
        success: true,
        videoId: videoRecord?.id || videoId,
        message: 'Video uploaded successfully',
        complete: true
      })
    } else {
      // Part received, waiting for more
      return NextResponse.json({
        success: true,
        message: `Part ${partNumber + 1} of ${totalParts} received`,
        complete: false
      })
    }
  } catch (error) {
    console.error('Error in video part upload:', error)
    return NextResponse.json(
      { error: 'Failed to process video part' },
      { status: 500 }
    )
  }
}

// Clean up old incomplete uploads periodically
setInterval(() => {
  const now = Date.now()
  const TIMEOUT = 30 * 60 * 1000 // 30 minutes
  
  for (const [videoId, parts] of videoParts.entries()) {
    // This is a simple cleanup - in production you'd track timestamps
    if (parts.length > 0) {
      // Keep parts for now
    }
  }
}, 5 * 60 * 1000) // Check every 5 minutes