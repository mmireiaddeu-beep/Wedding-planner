'use client';

import { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { Vendor, VendorStatus } from '@/lib/types';

const SERVICES = ['Venue', 'Catering', 'Fotografía', 'Vídeo', 'Música/DJ', 'Flores', 'Pastel', 'Transporte', 'Peluquería', 'Maquillaje', 'Invitaciones', 'Joyería', 'Vestido', 'Traje', 'Otros'];

const statusColors: Record<VendorStatus, string> = {
  contacted: 'bg-blue-100 text-blue-700',
  negotiating: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  paid: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};
const statusLabels: Record<VendorStatus, string> = {
  contacted: 'Contactado',
  negotiating: 'Negociando',
  confirmed: 'Confirmado',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

const emptyVendor: Omit<Vendor, 'id'> = {
  name: '', service: 'Venue', contactName: '', email: '', phone: '',
  totalPrice: 0, depositPaid: 0, status: 'contacted', notes: '', website: '',
};

export default function VendorsPage() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Omit<Vendor, 'id'>>(emptyVendor);
  const [filterService, setFilterService] = useState('all');

  const services = [...new Set(vendors.map(v => v.service))];
  const filtered = filterService === 'all' ? vendors : vendors.filter(v => v.service === filterService);

  const openAdd = () => { setEditing(null); setForm(emptyVendor); setShowForm(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setForm({ ...v }); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editing) updateVendor({ ...form, id: editing.id });
    else addVendor(form);
    setShowForm(false);
  };

  const totalBudget = vendors.reduce((s, v) => s + v.totalPrice, 0);
  const confirmed = vendors.filter(v => v.status === 'confirmed' || v.status === 'paid').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rose-800">🏪 Proveedores</h1>
          <p className="text-sm text-rose-400 mt-1">
            {vendors.length} proveedores · {confirmed} confirmados · {totalBudget.toLocaleString('es-ES')}€ total
          </p>
        </div>
        <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Añadir proveedor
        </button>
      </div>

      {vendors.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
            <p className="text-xs text-gray-500">Presupuesto total</p>
            <p className="text-xl font-bold text-gray-700 mt-1">{totalBudget.toLocaleString('es-ES')}€</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
            <p className="text-xs text-gray-500">Depósitos pagados</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              {vendors.reduce((s, v) => s + v.depositPaid, 0).toLocaleString('es-ES')}€
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
            <p className="text-xs text-gray-500">Pendiente de pago</p>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {(totalBudget - vendors.reduce((s, v) => s + v.depositPaid, 0)).toLocaleString('es-ES')}€
            </p>
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilterService('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterService === 'all' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-rose-200 hover:bg-rose-50'}`}
          >
            Todos ({vendors.length})
          </button>
          {services.map(s => (
            <button
              key={s}
              onClick={() => setFilterService(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterService === s ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-rose-200 hover:bg-rose-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏪</p>
            <p>{vendors.length === 0 ? 'Añade tu primer proveedor' : 'No hay proveedores en esta categoría'}</p>
          </div>
        ) : (
          filtered.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{vendor.name}</span>
                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{vendor.service}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[vendor.status]}`}>
                      {statusLabels[vendor.status]}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    {vendor.contactName && <span>👤 {vendor.contactName}</span>}
                    {vendor.phone && <span>📞 {vendor.phone}</span>}
                    {vendor.email && <span>✉️ {vendor.email}</span>}
                    {vendor.website && (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">
                        🌐 Web
                      </a>
                    )}
                  </div>
                  {vendor.totalPrice > 0 && (
                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                      <span className="font-medium text-gray-700">Total: {vendor.totalPrice.toLocaleString('es-ES')}€</span>
                      {vendor.depositPaid > 0 && (
                        <span className="text-green-600">Señal: {vendor.depositPaid.toLocaleString('es-ES')}€</span>
                      )}
                      {vendor.totalPrice > vendor.depositPaid && (
                        <span className="text-rose-500">Pendiente: {(vendor.totalPrice - vendor.depositPaid).toLocaleString('es-ES')}€</span>
                      )}
                    </div>
                  )}
                  {vendor.notes && <p className="text-xs text-gray-400 mt-1.5">{vendor.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(vendor)} className="text-gray-300 hover:text-rose-500 transition-colors">✏️</button>
                  <button onClick={() => deleteVendor(vendor.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-rose-700 mb-4">{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <div className="space-y-3">
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Nombre del proveedor *"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.service}
                  onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}
                >
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value as VendorStatus }))}
                >
                  {(Object.keys(statusLabels) as VendorStatus[]).map(s => (
                    <option key={s} value={s}>{statusLabels[s]}</option>
                  ))}
                </select>
              </div>
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Nombre de contacto"
                value={form.contactName}
                onChange={e => setForm(prev => ({ ...prev, contactName: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                />
                <input
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Precio total (€)</label>
                  <input
                    type="number" min="0"
                    className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={form.totalPrice || ''}
                    onChange={e => setForm(prev => ({ ...prev, totalPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Señal / depósito (€)</label>
                  <input
                    type="number" min="0"
                    className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={form.depositPaid || ''}
                    onChange={e => setForm(prev => ({ ...prev, depositPaid: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Sitio web"
                value={form.website}
                onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
              />
              <textarea
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="Notas (contrato, condiciones...)"
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
                {editing ? 'Guardar cambios' : 'Añadir proveedor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
