import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { email, name, rsvp, secondCourse, allergyNotes, companionName, busService } = body;

  const row = {
    name: name ?? '',
    email: email ?? '',
    phone: '',
    allergies: [],
    allergy_notes: allergyNotes ?? '',
    diet: 'omnivore',
    rsvp: rsvp ?? 'pending',
    table_id: '',
    side: 'both',
    notes: '',
    second_course: secondCourse ?? '',
    companion_name: companionName ?? '',
    bus_service: busService ?? false,
    source: 'form',
  };

  const { data: existing } = await supabase
    .from('guests')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('guests').update(row).eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: true });
  }

  const { error } = await supabase.from('guests').insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ created: true });
}
