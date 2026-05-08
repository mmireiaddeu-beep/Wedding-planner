import { Guest } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToGuest(row: any): Guest {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    allergies: row.allergies ?? [],
    allergyNotes: row.allergy_notes ?? '',
    diet: row.diet ?? 'omnivore',
    rsvp: row.rsvp ?? 'pending',
    tableId: row.table_id ?? '',
    side: row.side ?? 'both',
    notes: row.notes ?? '',
    secondCourse: row.second_course ?? '',
    companionName: row.companion_name ?? '',
    busService: row.bus_service ?? false,
    source: row.source ?? 'manual',
  };
}

export function guestToRow(g: Omit<Guest, 'id'>) {
  return {
    name: g.name,
    email: g.email,
    phone: g.phone,
    allergies: g.allergies,
    allergy_notes: g.allergyNotes,
    diet: g.diet,
    rsvp: g.rsvp,
    table_id: g.tableId,
    side: g.side,
    notes: g.notes,
    second_course: g.secondCourse,
    companion_name: g.companionName,
    bus_service: g.busService,
    source: g.source,
  };
}
