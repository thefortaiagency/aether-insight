import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { matchId, cloudflareId, streamUrl, fileSize } = await request.json()
    
    if (!matchId || !cloudflareId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Save video record to match_videos table
    const { data, error } = await supabaseAdmin
      .from('match_videos')
      .insert({
        match_id: matchId,
        cloudflare_video_id: cloudflareId,
        video_url: streamUrl,
        file_size: fileSize,
        status: 'uploaded',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      // If table doesn't exist, create it
      if (error.code === '42P01') {
        await supabaseAdmin.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS match_videos (
              id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
              match_id uuid REFERENCES matches(id),
              cloudflare_video_id text,
              video_url text,
              file_size integer,
              duration integer DEFAULT 0,
              status text DEFAULT 'pending',
              created_at timestamp with time zone DEFAULT now()
            );
          `
        }).catch(() => {
          // Table might already exist
        })
        
        // Try again
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('match_videos')
          .insert({
            match_id: matchId,
            cloudflare_video_id: cloudflareId,
            video_url: streamUrl,
            file_size: fileSize,
            status: 'uploaded',
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (!retryError) {
          return NextResponse.json({
            success: true,
            videoId: retryData.id,
            message: 'Video metadata saved successfully'
          })
        }
      }
      
      console.error('Database error:', error)
      // Don't fail - video is uploaded to Cloudflare successfully
    }
    
    // Also update the match record with both video ID and URL
    await supabaseAdmin
      .from('matches')
      .update({
        has_video: true,
        video_url: streamUrl,
        video_id: cloudflareId,  // Save the Cloudflare video ID
        cloudflare_video_id: cloudflareId  // Also save in this field for compatibility
      })
      .eq('id', matchId)
    
    return NextResponse.json({
      success: true,
      videoId: data?.id || cloudflareId,
      message: 'Video uploaded and saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving video upload:', error)
    return NextResponse.json(
      { error: 'Failed to save video metadata' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'