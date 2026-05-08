'use client';

import { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { Payment } from '@/lib/types';

const emptyPayment: Omit<Payment, 'id'> = {
  vendorId: '', description: '', amount: 0, dueDate: '', paid: false, paidDate: '', notes: '',
};

export default function BudgetPage() {
  const { vendors, payments, addPayment, updatePayment, deletePayment } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<Omit<Payment, 'id'>>(emptyPayment);
  const [filterPaid, setFilterPaid] = useState<'all' | 'pending' | 'paid'>('all');

  const totalBudget = vendors.reduce((s, v) => s + v.totalPrice, 0);
  const totalPaid = payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);

  const today = new Date().toISOString().split('T')[0];

  const filtered = payments.filter(p => {
    if (filterPaid === 'pending') return !p.paid;
    if (filterPaid === 'paid') return p.paid;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.paid && !b.paid) return 1;
    if (!a.paid && b.paid) return -1;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyPayment, vendorId: vendors[0]?.id || '' });
    setShowForm(true);
  };
  const openEdit = (p: Payment) => { setEditing(p); setForm({ ...p }); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.description.trim() || form.amount <= 0) return;
    if (editing) updatePayment({ ...form, id: editing.id });
    else addPayment(form);
    setShowForm(false);
  };

  const togglePaid = (p: Payment) => {
    updatePayment({ ...p, paid: !p.paid, paidDate: !p.paid ? today : '' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rose-800">💰 Presupuesto</h1>
          <p className="text-sm text-rose-400 mt-1">Control de pagos y gastos</p>
        </div>
        <button
          onClick={openAdd}
          disabled={vendors.length === 0}
          className="bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          + Añadir pago
        </button>
      </div>

      {vendors.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
          ⚠️ Añade proveedores primero desde la sección <strong>Proveedores</strong> para poder registrar pagos.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
          <p className="text-xs text-gray-500">Presupuesto total</p>
          <p className="text-xl font-bold text-gray-700 mt-1">{totalBudget.toLocaleString('es-ES')}€</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
          <p className="text-xs text-gray-500">Pagado</p>
          <p className="text-xl font-bold text-green-600 mt-1">{totalPaid.toLocaleString('es-ES')}€</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
          <p className="text-xs text-gray-500">Por pagar</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{totalPending.toLocaleString('es-ES')}€</p>
        </div>
      </div>

      {totalBudget > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso del presupuesto</span>
            <span className="font-semibold text-rose-600">{Math.round((totalPaid / totalBudget) * 100)}% pagado</span>
          </div>
          <div className="w-full bg-rose-50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-rose-400 to-rose-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalPaid / totalBudget) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterPaid(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterPaid === f ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            {f === 'all' ? `Todos (${payments.length})` : f === 'pending' ? `Pendientes (${payments.filter(p => !p.paid).length})` : `Pagados (${payments.filter(p => p.paid).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💸</p>
            <p>{payments.length === 0 ? 'Registra tus pagos pendientes' : 'No hay pagos en esta categoría'}</p>
          </div>
        ) : (
          sorted.map(payment => {
            const vendor = vendors.find(v => v.id === payment.vendorId);
            const isOverdue = !payment.paid && payment.dueDate && payment.dueDate < today;

            return (
              <div
                key={payment.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 transition-all ${
                  payment.paid ? 'border-gray-100 opacity-70' : isOverdue ? 'border-red-200 bg-red-50/30' : 'border-rose-100'
                }`}
              >
                <button
                  onClick={() => togglePaid(payment)}
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
                    payment.paid ? 'bg-green-400 border-green-400 text-white' : 'border-rose-300 hover:border-green-400'
                  }`}
                >
                  {payment.paid && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${payment.paid ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {payment.description}
                    </span>
                    {vendor && (
                      <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">{vendor.name}</span>
                    )}
                    {isOverdue && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">⚠️ Vencido</span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                    {payment.dueDate && <span>📅 Vence: {new Date(payment.dueDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    {payment.paid && payment.paidDate && <span className="text-green-600">✓ Pagado: {new Date(payment.paidDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
                    {payment.notes && <span>{payment.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-bold text-sm ${payment.paid ? 'text-green-600' : 'text-rose-600'}`}>
                    {payment.amount.toLocaleString('es-ES')}€
                  </span>
                  <button onClick={() => openEdit(payment)} className="text-gray-300 hover:text-rose-500 transition-colors">✏️</button>
                  <button onClick={() => deletePayment(payment.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-rose-700 mb-4">{editing ? 'Editar pago' : 'Nuevo pago'}</h2>
            <div className="space-y-3">
              <select
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                value={form.vendorId}
                onChange={e => setForm(prev => ({ ...prev, vendorId: e.target.value }))}
              >
                <option value="">-- Selecciona proveedor --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.service})</option>)}
              </select>
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Descripción del pago *"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Importe (€) *</label>
                  <input
                    type="number" min="0"
                    className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={form.amount || ''}
                    onChange={e => setForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha límite</label>
                  <input
                    type="date"
                    className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    value={form.dueDate}
                    onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paid}
                  onChange={e => setForm(prev => ({ ...prev, paid: e.target.checked, paidDate: e.target.checked ? today : '' }))}
                  className="accent-rose-500 w-4 h-4"
                />
                Marcar como pagado
              </label>
              <textarea
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                placeholder="Notas"
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
                {editing ? 'Guardar' : 'Añadir pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
