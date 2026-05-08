'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Guest, Table, Task, Vendor, Payment } from '@/lib/types';

interface WeddingContextType {
  guests: Guest[];
  tables: Table[];
  tasks: Task[];
  vendors: Vendor[];
  payments: Payment[];
  addGuest: (g: Omit<Guest, 'id'>) => void;
  updateGuest: (g: Guest) => void;
  deleteGuest: (id: string) => void;
  addTable: (t: Omit<Table, 'id'>) => void;
  updateTable: (t: Table) => void;
  deleteTable: (id: string) => void;
  addTask: (t: Omit<Task, 'id'>) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addVendor: (v: Omit<Vendor, 'id'>) => void;
  updateVendor: (v: Vendor) => void;
  deleteVendor: (id: string) => void;
  addPayment: (p: Omit<Payment, 'id'>) => void;
  updatePayment: (p: Payment) => void;
  deletePayment: (id: string) => void;
  assignGuestToTable: (guestId: string, tableId: string) => void;
}

const WeddingContext = createContext<WeddingContextType | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function usePersistedState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setState(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(state));
  }, [key, state, loaded]);

  return [state, setState];
}

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [guests, setGuests] = usePersistedState<Guest[]>('wp_guests', []);
  const [tables, setTables] = usePersistedState<Table[]>('wp_tables', []);
  const [tasks, setTasks] = usePersistedState<Task[]>('wp_tasks', []);
  const [vendors, setVendors] = usePersistedState<Vendor[]>('wp_vendors', []);
  const [payments, setPayments] = usePersistedState<Payment[]>('wp_payments', []);

  const addGuest = (g: Omit<Guest, 'id'>) => setGuests(prev => [...prev, { ...g, id: uid() }]);
  const updateGuest = (g: Guest) => setGuests(prev => prev.map(x => x.id === g.id ? g : x));
  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(x => x.id !== id));
    setTables(prev => prev.map(t => ({ ...t, guestIds: t.guestIds.filter(gid => gid !== id) })));
  };

  const addTable = (t: Omit<Table, 'id'>) => setTables(prev => [...prev, { ...t, id: uid() }]);
  const updateTable = (t: Table) => setTables(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(x => x.id !== id));
    setGuests(prev => prev.map(g => g.tableId === id ? { ...g, tableId: '' } : g));
  };

  const assignGuestToTable = (guestId: string, tableId: string) => {
    const prevTableId = guests.find(g => g.id === guestId)?.tableId;
    if (prevTableId) {
      setTables(prev => prev.map(t =>
        t.id === prevTableId ? { ...t, guestIds: t.guestIds.filter(id => id !== guestId) } : t
      ));
    }
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, tableId } : g));
    if (tableId) {
      setTables(prev => prev.map(t =>
        t.id === tableId && !t.guestIds.includes(guestId)
          ? { ...t, guestIds: [...t.guestIds, guestId] }
          : t
      ));
    }
  };

  const addTask = (t: Omit<Task, 'id'>) => setTasks(prev => [...prev, { ...t, id: uid() }]);
  const updateTask = (t: Task) => setTasks(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(x => x.id !== id));
  const toggleTask = (id: string) => setTasks(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));

  const addVendor = (v: Omit<Vendor, 'id'>) => setVendors(prev => [...prev, { ...v, id: uid() }]);
  const updateVendor = (v: Vendor) => setVendors(prev => prev.map(x => x.id === v.id ? v : x));
  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(x => x.id !== id));
    setPayments(prev => prev.filter(p => p.vendorId !== id));
  };

  const addPayment = (p: Omit<Payment, 'id'>) => setPayments(prev => [...prev, { ...p, id: uid() }]);
  const updatePayment = (p: Payment) => setPayments(prev => prev.map(x => x.id === p.id ? p : x));
  const deletePayment = (id: string) => setPayments(prev => prev.filter(x => x.id !== id));

  return (
    <WeddingContext.Provider value={{
      guests, tables, tasks, vendors, payments,
      addGuest, updateGuest, deleteGuest,
      addTable, updateTable, deleteTable,
      addTask, updateTask, deleteTask, toggleTask,
      addVendor, updateVendor, deleteVendor,
      addPayment, updatePayment, deletePayment,
      assignGuestToTable,
    }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error('useWedding must be used within WeddingProvider');
  return ctx;
}
