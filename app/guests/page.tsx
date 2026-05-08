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

const emptyGuest: Omit<Guest, 'id'> = {
  name: '', email: '', phone: '', allergies: [], allergyNotes: '',
  diet: 'omnivore', rsvp: 'pending', tableId: '', side: 'both', notes: '',
  secondCourse: '', companionName: '', busService: false, source: 'manual',
};

export default function GuestsPage() {
  const { guests, guestsLoading, tables, addGuest, updateGuest, deleteGuest, refreshGuests } = useWedding();
  const [search, setSearch] = useState('');
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState<Omit<Guest, 'id'>>(emptyGuest);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const filtered = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchRsvp = filterRsvp === 'all' || g.rsvp === filterRsvp;
    return matchSearch && matchRsvp;
  });

  const openAdd = () => { setEditing(null); setForm(emptyGuest); setShowForm(true); };
  const openEdit = (g: Guest) => { setEditing(g); setForm({ ...g }); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editing) await updateGuest({ ...form, id: editing.id });
    else await addGuest(form);
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteGuest(id);
  };

  const handleSync = async () => {
    setSyncing(true);
    await refreshGuests();
    setSyncing(false);
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
  const busCount = guests.filter(g => g.busService).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rose-800">👥 Invitados</h1>
          <p className="text-sm text-rose-400 mt-1">
            {confirmed} confirmados · {pending} pendientes · {declined} declinados
            {busCount > 0 && ` · 🚌 ${busCount} autobús`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="border border-rose-200 text-rose-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Sincronizar con Google Sheets"
          >
            {syncing ? '⏳' : '🔄'}
          </button>
          <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            + Añadir
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Buscar..."
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

      {guestsLoading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-2xl animate-pulse">⏳</p>
          <p className="text-sm mt-2">Cargando invitados...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">👥</p>
              <p>{guests.length === 0 ? 'Aún no hay invitados' : 'No hay resultados'}</p>
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
                      {guest.source === 'form' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">📋 Form</span>
                      )}
                      {(guest.allergyNotes && guest.allergyNotes.toLowerCase() !== 'no') && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">⚠️ Alergia</span>
                      )}
                      {guest.busService && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">🚌 Autobús</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      {guest.email && <span>✉️ {guest.email}</span>}
                      {guest.phone && <span>📞 {guest.phone}</span>}
                      {table && <span>🪑 {table.name}</span>}
                      {guest.secondCourse && <span>🍽️ {guest.secondCourse}</span>}
                      {guest.companionName && <span>👤 +1: {guest.companionName}</span>}
                    </div>
                    {guest.allergyNotes && guest.allergyNotes.toLowerCase() !== 'no' && (
                      <p className="text-xs text-orange-600 mt-1.5 bg-orange-50 px-2 py-1 rounded-lg">
                        ⚠️ {guest.allergyNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(guest)} className="text-gray-300 hover:text-rose-500 transition-colors">✏️</button>
                    <button onClick={() => handleDelete(guest.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-rose-700 mb-4">
              {editing ? 'Editar invitado' : 'Nuevo invitado'}
            </h2>
            <div className="space-y-3">
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Nom i cognoms *"
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
                  placeholder="Telèfon"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.rsvp}
                  onChange={e => setForm(prev => ({ ...prev, rsvp: e.target.value as RSVPStatus }))}
                >
                  <option value="pending">Pendent</option>
                  <option value="confirmed">Confirmat</option>
                  <option value="declined">Declinat</option>
                </select>
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.side}
                  onChange={e => setForm(prev => ({ ...prev, side: e.target.value as GuestSide }))}
                >
                  <option value="both">Ambdós</option>
                  <option value="bride">Núvia</option>
                  <option value="groom">Nuvi</option>
                </select>
              </div>
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Segon plat"
                value={form.secondCourse}
                onChange={e => setForm(prev => ({ ...prev, secondCourse: e.target.value }))}
              />
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Nom i cognoms de l'acompanyant"
                value={form.companionName}
                onChange={e => setForm(prev => ({ ...prev, companionName: e.target.value }))}
              />
              {tables.length > 0 && (
                <select
                  className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.tableId}
                  onChange={e => setForm(prev => ({ ...prev, tableId: e.target.value }))}
                >
                  <option value="">Sense taula assignada</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.guestIds.length}/{t.capacity})</option>
                  ))}
                </select>
              )}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Al·lèrgies i intoleràncies</p>
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
                placeholder="Detalls al·lèrgies (text lliure)"
                rows={2}
                value={form.allergyNotes}
                onChange={e => setForm(prev => ({ ...prev, allergyNotes: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.busService}
                  onChange={e => setForm(prev => ({ ...prev, busService: e.target.checked }))}
                  className="accent-rose-500 w-4 h-4"
                />
                Vol servei d&apos;autocar
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-rose-200 text-rose-600 py-2 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? 'Guardant...' : editing ? 'Guardar' : 'Afegir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
