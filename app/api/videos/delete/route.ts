import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('id')

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

    // Delete video from Cloudflare Stream
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete video: ${error}`)
    }

    return NextResponse.json({ success: true, message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}