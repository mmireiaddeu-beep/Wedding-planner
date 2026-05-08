import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guestToRow, rowToGuest } from '@/lib/guestMapper';

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(rowToGuest));
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { data, error } = await supabase
    .from('guests')
    .insert(guestToRow(body))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToGuest(data));
}
