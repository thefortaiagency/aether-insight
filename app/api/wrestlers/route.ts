import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/wrestlers - Get all wrestlers or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('team_id')
    const weightClass = searchParams.get('weight_class')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabaseAdmin
      .from('wrestlers')
      .select(`
        *,
        team:teams (
          id,
          name,
          school,
          division
        ),
        season_records (
          season,
          wins,
          losses,
          pins,
          tech_falls,
          major_decisions,
          team_points
        )
      `)
      .order('last_name', { ascending: true })
      .limit(limit)

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    if (weightClass) {
      query = query.eq('weight_class', parseInt(weightClass))
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching wrestlers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/wrestlers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/wrestlers - Create a new wrestler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: wrestler, error: wrestlerError } = await supabase
      .from('wrestlers')
      .insert({
        team_id: body.team_id || null,
        first_name: body.first_name,
        last_name: body.last_name,
        grade: body.grade,
        weight_class: body.weight_class,
        actual_weight: body.actual_weight,
        birth_date: body.birth_date,
        email: body.email,
        phone: body.phone,
        photo_url: body.photo_url,
        status: body.status || 'active'
      })
      .select()
      .single()

    if (wrestlerError) {
      console.error('Error creating wrestler:', wrestlerError)
      return NextResponse.json({ error: wrestlerError.message }, { status: 500 })
    }

    // Create initial season record if season provided
    if (body.season) {
      const { error: seasonError } = await supabaseAdmin
        .from('season_records')
        .insert({
          wrestler_id: wrestler.id,
          season: body.season,
          wins: 0,
          losses: 0,
          pins: 0,
          tech_falls: 0,
          major_decisions: 0,
          team_points: 0,
          tournament_placements: []
        })

      if (seasonError) {
        console.error('Error creating season record:', seasonError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: wrestler,
      message: 'Wrestler created successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/wrestlers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/wrestlers/bulk-import - Bulk import wrestlers
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.wrestlers || !Array.isArray(body.wrestlers)) {
      return NextResponse.json({ error: 'Invalid wrestlers data' }, { status: 400 })
    }

    const results = {
      success: [] as any[],
      errors: [] as Array<{wrestler: string, error: string}>
    }

    for (const wrestlerData of body.wrestlers) {
      const { data, error } = await supabaseAdmin
        .from('wrestlers')
        .insert({
          team_id: wrestlerData.team_id || body.team_id || null,
          first_name: wrestlerData.first_name,
          last_name: wrestlerData.last_name,
          grade: wrestlerData.grade,
          weight_class: wrestlerData.weight_class,
          actual_weight: wrestlerData.actual_weight,
          birth_date: wrestlerData.birth_date,
          email: wrestlerData.email,
          phone: wrestlerData.phone,
          status: wrestlerData.status || 'active'
        })
        .select()
        .single()

      if (error) {
        results.errors.push({
          wrestler: `${wrestlerData.first_name} ${wrestlerData.last_name}`,
          error: error.message
        })
      } else {
        results.success.push(data)
        
        // Create season record if provided
        if (body.season) {
          await supabaseAdmin
            .from('season_records')
            .insert({
              wrestler_id: data.id,
              season: body.season,
              wins: 0,
              losses: 0,
              pins: 0,
              tech_falls: 0,
              major_decisions: 0,
              team_points: 0,
              tournament_placements: []
            })
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: results,
      message: `Imported ${results.success.length} wrestlers successfully`
    })
  } catch (error) {
    console.error('Error in PATCH /api/wrestlers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}