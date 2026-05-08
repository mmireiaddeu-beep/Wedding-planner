'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Guest, Table, Task, Vendor, Payment } from '@/lib/types';

interface WeddingContextType {
  guests: Guest[];
  guestsLoading: boolean;
  tables: Table[];
  tasks: Task[];
  vendors: Vendor[];
  payments: Payment[];
  refreshGuests: () => Promise<void>;
  addGuest: (g: Omit<Guest, 'id'>) => Promise<void>;
  updateGuest: (g: Guest) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
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
  assignGuestToTable: (guestId: string, tableId: string) => Promise<void>;
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
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [tables, setTables] = usePersistedState<Table[]>('wp_tables', []);
  const [tasks, setTasks] = usePersistedState<Task[]>('wp_tasks', []);
  const [vendors, setVendors] = usePersistedState<Vendor[]>('wp_vendors', []);
  const [payments, setPayments] = usePersistedState<Payment[]>('wp_payments', []);

  const refreshGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/guests');
      if (res.ok) setGuests(await res.json());
    } catch {}
    finally { setGuestsLoading(false); }
  }, []);

  useEffect(() => {
    refreshGuests();
    const interval = setInterval(refreshGuests, 30_000);
    return () => clearInterval(interval);
  }, [refreshGuests]);

  const addGuest = async (g: Omit<Guest, 'id'>) => {
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g),
    });
    if (res.ok) {
      const newGuest = await res.json();
      setGuests(prev => [...prev, newGuest]);
    }
  };

  const updateGuest = async (g: Guest) => {
    const res = await fetch(`/api/guests/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g),
    });
    if (res.ok) setGuests(prev => prev.map(x => x.id === g.id ? g : x));
  };

  const deleteGuest = async (id: string) => {
    await fetch(`/api/guests/${id}`, { method: 'DELETE' });
    setGuests(prev => prev.filter(x => x.id !== id));
    setTables(prev => prev.map(t => ({ ...t, guestIds: t.guestIds.filter(gid => gid !== id) })));
  };

  const assignGuestToTable = async (guestId: string, tableId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    const prevTableId = guest.tableId;
    if (prevTableId) {
      setTables(prev => prev.map(t =>
        t.id === prevTableId ? { ...t, guestIds: t.guestIds.filter(id => id !== guestId) } : t
      ));
    }
    const updated = { ...guest, tableId };
    await updateGuest(updated);
    if (tableId) {
      setTables(prev => prev.map(t =>
        t.id === tableId && !t.guestIds.includes(guestId)
          ? { ...t, guestIds: [...t.guestIds, guestId] }
          : t
      ));
    }
  };

  const addTable = (t: Omit<Table, 'id'>) => setTables(prev => [...prev, { ...t, id: uid() }]);
  const updateTable = (t: Table) => setTables(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(x => x.id !== id));
    guests.filter(g => g.tableId === id).forEach(g => updateGuest({ ...g, tableId: '' }));
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
      guests, guestsLoading,
      tables, tasks, vendors, payments,
      refreshGuests,
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
