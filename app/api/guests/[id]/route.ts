import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { guestToRow, rowToGuest } from '@/lib/guestMapper';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase
    .from('guests')
    .update(guestToRow(body))
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(rowToGuest(data));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  const { id } = await params;
  const { error } = await supabase.from('guests').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
