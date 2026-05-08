'use client';

import { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { Table } from '@/lib/types';

const emptyTable: Omit<Table, 'id'> = { name: '', capacity: 8, guestIds: [], notes: '' };

export default function TablesPage() {
  const { tables, guests, addTable, updateTable, deleteTable, assignGuestToTable } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [form, setForm] = useState<Omit<Table, 'id'>>(emptyTable);

  const unassignedGuests = guests.filter(g => !g.tableId && g.rsvp !== 'declined');

  const openAdd = () => { setEditing(null); setForm(emptyTable); setShowForm(true); };
  const openEdit = (t: Table) => { setEditing(t); setForm({ name: t.name, capacity: t.capacity, guestIds: t.guestIds, notes: t.notes }); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editing) updateTable({ ...form, id: editing.id });
    else addTable(form);
    setShowForm(false);
  };

  const totalSeats = tables.reduce((s, t) => s + t.capacity, 0);
  const occupiedSeats = tables.reduce((s, t) => s + t.guestIds.length, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rose-800">🪑 Mesas</h1>
          <p className="text-sm text-rose-400 mt-1">
            {tables.length} mesas · {occupiedSeats}/{totalSeats} asientos ocupados
            {unassignedGuests.length > 0 && ` · ${unassignedGuests.length} sin asignar`}
          </p>
        </div>
        <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Nueva mesa
        </button>
      </div>

      {unassignedGuests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-amber-800 mb-2">⚠️ Invitados sin mesa asignada ({unassignedGuests.length})</p>
          <div className="flex flex-wrap gap-2">
            {unassignedGuests.map(g => (
              <span key={g.id} className="text-xs bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {tables.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🪑</p>
          <p>Crea tu primera mesa para organizar el banquete</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {tables.map(table => {
            const tableGuests = guests.filter(g => table.guestIds.includes(g.id));
            const isFull = tableGuests.length >= table.capacity;
            const pct = Math.min(100, (tableGuests.length / table.capacity) * 100);

            return (
              <div key={table.id} className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{table.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tableGuests.length}/{table.capacity} personas
                        {isFull && <span className="ml-1.5 text-red-500 font-medium">· Completa</span>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(table)} className="text-gray-300 hover:text-rose-500 transition-colors">✏️</button>
                      <button onClick={() => deleteTable(table.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                    </div>
                  </div>

                  <div className="w-full bg-rose-50 rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-rose-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 min-h-[40px]">
                    {tableGuests.map(g => (
                      <div key={g.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs flex-shrink-0">
                            {g.name[0]?.toUpperCase()}
                          </span>
                          <span className="text-gray-700">{g.name}</span>
                          {g.allergies.length > 0 && (
                            <span title={g.allergies.join(', ')} className="text-orange-400 text-xs">⚠️</span>
                          )}
                        </div>
                        <button
                          onClick={() => assignGuestToTable(g.id, '')}
                          className="text-gray-200 hover:text-red-400 transition-colors text-xs ml-2"
                          title="Quitar de esta mesa"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  {!isFull && unassignedGuests.length > 0 && (
                    <select
                      className="w-full mt-3 border border-dashed border-rose-200 rounded-xl px-2 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-rose-300 bg-rose-50/50"
                      onChange={e => { if (e.target.value) { assignGuestToTable(e.target.value, table.id); e.target.value = ''; }}}
                      value=""
                    >
                      <option value="">+ Asignar invitado</option>
                      {unassignedGuests.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  )}

                  {table.notes && <p className="text-xs text-gray-400 mt-2">{table.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-rose-700 mb-4">{editing ? 'Editar mesa' : 'Nueva mesa'}</h2>
            <div className="space-y-4">
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Nombre de la mesa (ej: Mesa de los novios) *"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-gray-600 font-medium">Capacidad</label>
                  <span className="text-rose-600 font-bold">{form.capacity} personas</span>
                </div>
                <input
                  type="range" min="2" max="20"
                  value={form.capacity}
                  onChange={e => setForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2</span><span>20</span>
                </div>
              </div>
              <textarea
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="Notas (ubicación, decoración...)"
                rows={2}
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-rose-200 text-rose-600 py-2 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                {editing ? 'Guardar' : 'Crear mesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
