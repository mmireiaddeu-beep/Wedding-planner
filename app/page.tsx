'use client';

import Link from 'next/link';
import { useWedding } from '@/context/WeddingContext';

export default function Dashboard() {
  const { guests, tables, tasks, vendors, payments } = useWedding();

  const confirmed = guests.filter(g => g.rsvp === 'confirmed').length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const totalBudget = vendors.reduce((sum, v) => sum + v.totalPrice, 0);
  const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const completedTasks = tasks.filter(t => t.completed).length;

  const stats = [
    { label: 'Invitados confirmados', value: `${confirmed}/${guests.length}`, icon: '👥', href: '/guests' },
    { label: 'Mesas creadas', value: String(tables.length), icon: '🪑', href: '/tables' },
    { label: 'Tareas pendientes', value: String(pendingTasks), icon: '✅', href: '/tasks' },
    { label: 'Proveedores', value: String(vendors.length), icon: '🏪', href: '/vendors' },
  ];

  const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 5);
  const upcomingPayments = payments
    .filter(p => !p.paid)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-rose-800">Bienvenida 💍</h1>
        <p className="text-rose-400 mt-1 text-sm">Aquí tienes el resumen de tu planificación</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-rose-700">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <h2 className="text-base font-semibold text-rose-700 mb-4">💰 Presupuesto</h2>
          {totalBudget === 0 ? (
            <p className="text-sm text-gray-400">Añade proveedores para ver el presupuesto</p>
          ) : (
            <>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-500">Pagado</span>
                <span className="font-semibold text-green-600">{totalPaid.toLocaleString('es-ES')}€</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Total presupuestado</span>
                <span className="font-semibold text-gray-700">{totalBudget.toLocaleString('es-ES')}€</span>
              </div>
              <div className="w-full bg-rose-100 rounded-full h-2">
                <div
                  className="bg-rose-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalPaid / totalBudget) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{Math.round((totalPaid / totalBudget) * 100)}% pagado</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <h2 className="text-base font-semibold text-rose-700 mb-4">✅ Tareas pendientes</h2>
          {tasks.length > 0 && (
            <div className="w-full bg-rose-100 rounded-full h-1.5 mb-3">
              <div
                className="bg-rose-400 h-1.5 rounded-full transition-all"
                style={{ width: tasks.length > 0 ? `${(completedTasks / tasks.length) * 100}%` : '0%' }}
              />
            </div>
          )}
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No hay tareas pendientes 🎉</p>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.map(task => (
                <li key={task.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <span className="text-gray-700 flex-1 truncate">{task.title}</span>
                  {task.dueDate && <span className="text-gray-400 text-xs">{task.dueDate}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <h2 className="text-base font-semibold text-rose-700 mb-4">💸 Próximos pagos</h2>
          {upcomingPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No hay pagos pendientes</p>
          ) : (
            <ul className="space-y-2">
              {upcomingPayments.map(p => {
                const vendor = vendors.find(v => v.id === p.vendorId);
                return (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700 flex-1 truncate">{p.description}</span>
                    {vendor && <span className="text-xs text-gray-400">{vendor.name}</span>}
                    <span className="font-semibold text-rose-600">{p.amount.toLocaleString('es-ES')}€</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
          <h2 className="text-base font-semibold text-rose-700 mb-4">⚠️ Alergias e intolerancias</h2>
          {guests.filter(g => g.allergies.length > 0).length === 0 ? (
            <p className="text-sm text-gray-400">Ningún invitado tiene alergias registradas</p>
          ) : (
            <ul className="space-y-2">
              {guests.filter(g => g.allergies.length > 0).slice(0, 5).map(g => (
                <li key={g.id} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-700 font-medium w-28 flex-shrink-0 truncate">{g.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {g.allergies.map(a => (
                      <span key={a} className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
