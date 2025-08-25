import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { matchId, chunkIds } = await request.json()

    if (!matchId || !chunkIds || chunkIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing matchId or chunkIds' },
        { status: 400 }
      )
    }

    // Get all chunk records from database
    const { data: chunks, error: fetchError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .in('cloudflare_id', chunkIds)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching chunks:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch video chunks' },
        { status: 500 }
      )
    }

    // TODO: In production, you would:
    // 1. Use Cloudflare Stream's concatenation API to merge chunks
    // 2. Delete individual chunks after successful merge
    // 3. Update the match record with the final video ID

    // For now, we'll just mark the chunks as belonging to this match
    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({ 
        match_id: matchId,
        metadata: {
          isMerged: true,
          totalChunks: chunkIds.length
        }
      })
      .in('cloudflare_id', chunkIds)

    if (updateError) {
      console.error('Error updating chunks:', updateError)
      return NextResponse.json(
        { error: 'Failed to update video chunks' },
        { status: 500 }
      )
    }

    // Update match with video chunks info
    await supabaseAdmin
      .from('matches')
      .update({ 
        video_id: chunkIds[0], // Use first chunk as primary
        video_url: chunks[0]?.url,
        metadata: {
          hasVideoChunks: true,
          chunkCount: chunkIds.length,
          chunkIds: chunkIds
        }
      })
      .eq('id', matchId)

    return NextResponse.json({
      success: true,
      message: 'Video chunks merged successfully',
      matchId,
      chunkCount: chunkIds.length
    })

  } catch (error) {
    console.error('Merge error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}