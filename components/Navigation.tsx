'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/guests', label: 'Invitados', icon: '👥' },
  { href: '/tables', label: 'Mesas', icon: '🪑' },
  { href: '/tasks', label: 'Tareas', icon: '✅' },
  { href: '/vendors', label: 'Proveedores', icon: '🏪' },
  { href: '/budget', label: 'Presupuesto', icon: '💰' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-rose-100 min-h-screen p-4 fixed left-0 top-0 z-40">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-rose-700">💍 Wedding</h1>
          <p className="text-xs text-rose-400">Planner</p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 z-50">
        <div className="flex justify-around py-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 text-xs ${
                pathname === link.href ? 'text-rose-600' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-[10px]">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
