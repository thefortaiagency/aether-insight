import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/teams - Get all teams or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const division = searchParams.get('division')
    const conference = searchParams.get('conference')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('teams')
      .select(`
        *,
        wrestlers (
          id,
          first_name,
          last_name,
          weight_class,
          status
        )
      `)
      .order('name', { ascending: true })
      .limit(limit)

    if (division) {
      query = query.eq('division', division)
    }

    if (conference) {
      query = query.eq('conference', conference)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,school.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add wrestler count to each team
    const teamsWithStats = data?.map(team => ({
      ...team,
      wrestler_count: team.wrestlers?.length || 0,
      active_wrestlers: team.wrestlers?.filter((w: any) => w.status === 'active').length || 0
    }))

    return NextResponse.json({ data: teamsWithStats })
  } catch (error) {
    console.error('Error in GET /api/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: body.name,
        school: body.school,
        division: body.division,
        conference: body.conference,
        logo_url: body.logo_url,
        coach_name: body.coach_name,
        assistant_coaches: body.assistant_coaches || [],
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip
      })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json({ error: teamError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: team,
      message: 'Team created successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('id')
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
    }

    const body = await request.json()
    
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .update({
        name: body.name,
        school: body.school,
        division: body.division,
        conference: body.conference,
        logo_url: body.logo_url,
        coach_name: body.coach_name,
        assistant_coaches: body.assistant_coaches,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip
      })
      .eq('id', teamId)
      .select()
      .single()

    if (teamError) {
      console.error('Error updating team:', teamError)
      return NextResponse.json({ error: teamError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: team,
      message: 'Team updated successfully'
    })
  } catch (error) {
    console.error('Error in PATCH /api/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('id')
    
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 })
    }

    // Check if team has wrestlers
    const { data: wrestlers } = await supabase
      .from('wrestlers')
      .select('id')
      .eq('team_id', teamId)
      .limit(1)

    if (wrestlers && wrestlers.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete team with active wrestlers. Please reassign or delete wrestlers first.' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) {
      console.error('Error deleting team:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Team deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}