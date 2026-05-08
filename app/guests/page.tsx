'use client';

import { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { Guest, RSVPStatus, DietType, GuestSide } from '@/lib/types';

const ALLERGIES = ['Gluten', 'Lactosa', 'Frutos secos', 'Marisco', 'Huevos', 'Soja', 'Pescado', 'Mostaza'];

const rsvpColors: Record<RSVPStatus, string> = {
  confirmed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};
const rsvpLabels: Record<RSVPStatus, string> = {
  confirmed: 'Confirmado',
  declined: 'Declinado',
  pending: 'Pendiente',
};
const dietLabels: Record<DietType, string> = {
  omnivore: 'Omnívoro',
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
  pescatarian: 'Pescetariano',
};
const sideLabels: Record<GuestSide, string> = {
  bride: 'Novia',
  groom: 'Novio',
  both: 'Ambos',
};

const emptyGuest: Omit<Guest, 'id'> = {
  name: '', email: '', phone: '', allergies: [],
  diet: 'omnivore', rsvp: 'pending', tableId: '', side: 'both', notes: '',
};

export default function GuestsPage() {
  const { guests, tables, addGuest, updateGuest, deleteGuest } = useWedding();
  const [search, setSearch] = useState('');
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState<Omit<Guest, 'id'>>(emptyGuest);

  const filtered = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchRsvp = filterRsvp === 'all' || g.rsvp === filterRsvp;
    return matchSearch && matchRsvp;
  });

  const openAdd = () => { setEditing(null); setForm(emptyGuest); setShowForm(true); };
  const openEdit = (g: Guest) => { setEditing(g); setForm({ ...g }); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editing) updateGuest({ ...form, id: editing.id });
    else addGuest(form);
    setShowForm(false);
  };

  const toggleAllergy = (a: string) => {
    setForm(prev => ({
      ...prev,
      allergies: prev.allergies.includes(a)
        ? prev.allergies.filter(x => x !== a)
        : [...prev.allergies, a],
    }));
  };

  const confirmed = guests.filter(g => g.rsvp === 'confirmed').length;
  const pending = guests.filter(g => g.rsvp === 'pending').length;
  const declined = guests.filter(g => g.rsvp === 'declined').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rose-800">👥 Invitados</h1>
          <p className="text-sm text-rose-400 mt-1">
            {confirmed} confirmados · {pending} pendientes · {declined} declinados
          </p>
        </div>
        <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Añadir invitado
        </button>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Buscar invitado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-rose-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
        />
        <select
          value={filterRsvp}
          onChange={e => setFilterRsvp(e.target.value)}
          className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
        >
          <option value="all">Todos ({guests.length})</option>
          <option value="confirmed">Confirmados ({confirmed})</option>
          <option value="pending">Pendientes ({pending})</option>
          <option value="declined">Declinados ({declined})</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p>{guests.length === 0 ? 'Añade tu primer invitado' : 'No hay resultados'}</p>
          </div>
        ) : (
          filtered.map(guest => {
            const table = tables.find(t => t.id === guest.tableId);
            return (
              <div key={guest.id} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold flex-shrink-0 text-sm">
                  {guest.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{guest.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rsvpColors[guest.rsvp]}`}>
                      {rsvpLabels[guest.rsvp]}
                    </span>
                    {guest.allergies.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">⚠️ Alergias</span>
                    )}
                    {guest.diet !== 'omnivore' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{dietLabels[guest.diet]}</span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    {guest.email && <span>✉️ {guest.email}</span>}
                    {guest.phone && <span>📞 {guest.phone}</span>}
                    {table && <span>🪑 {table.name}</span>}
                    <span className="text-rose-400">{sideLabels[guest.side]}</span>
                  </div>
                  {guest.allergies.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {guest.allergies.map(a => (
                        <span key={a} className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                  {guest.notes && <p className="text-xs text-gray-400 mt-1">{guest.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(guest)} className="text-gray-300 hover:text-rose-500 transition-colors text-base">✏️</button>
                  <button onClick={() => deleteGuest(guest.id)} className="text-gray-300 hover:text-red-500 transition-colors text-base">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-rose-700 mb-4">
              {editing ? 'Editar invitado' : 'Nuevo invitado'}
            </h2>
            <div className="space-y-3">
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Nombre completo *"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
                <input
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.rsvp}
                  onChange={e => setForm(prev => ({ ...prev, rsvp: e.target.value as RSVPStatus }))}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="declined">Declinado</option>
                </select>
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.side}
                  onChange={e => setForm(prev => ({ ...prev, side: e.target.value as GuestSide }))}
                >
                  <option value="both">Ambos</option>
                  <option value="bride">Novia</option>
                  <option value="groom">Novio</option>
                </select>
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.diet}
                  onChange={e => setForm(prev => ({ ...prev, diet: e.target.value as DietType }))}
                >
                  <option value="omnivore">Omnívoro</option>
                  <option value="vegetarian">Vegetariano</option>
                  <option value="vegan">Vegano</option>
                  <option value="pescatarian">Pescetariano</option>
                </select>
              </div>
              {tables.length > 0 && (
                <select
                  className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.tableId}
                  onChange={e => setForm(prev => ({ ...prev, tableId: e.target.value }))}
                >
                  <option value="">Sin mesa asignada</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.guestIds.length}/{t.capacity})</option>
                  ))}
                </select>
              )}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Alergias e intolerancias</p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        form.allergies.includes(a)
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="Notas adicionales (otras alergias, preferencias...)"
                rows={2}
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-rose-200 text-rose-600 py-2 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {editing ? 'Guardar cambios' : 'Añadir invitado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
