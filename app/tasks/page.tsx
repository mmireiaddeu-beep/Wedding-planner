'use client';

import { useState } from 'react';
import { useWedding } from '@/context/WeddingContext';
import { Task, TaskPriority } from '@/lib/types';

const CATEGORIES = ['Venue', 'Catering', 'Flores', 'Música', 'Fotografía', 'Vestido/Traje', 'Invitaciones', 'Luna de miel', 'Ceremonia', 'Decoración', 'Otros'];

const priorityColors: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-green-100 text-green-600',
};
const priorityLabels: Record<TaskPriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const emptyTask: Omit<Task, 'id'> = {
  title: '', category: 'Otros', dueDate: '', completed: false, priority: 'medium',
};

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useWedding();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Omit<Task, 'id'>>(emptyTask);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const grouped = filtered.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {});

  const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

  const openAdd = () => { setEditing(null); setForm(emptyTask); setShowForm(true); };
  const openEdit = (t: Task) => { setEditing(t); setForm({ ...t }); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (editing) updateTask({ ...form, id: editing.id });
    else addTask(form);
    setShowForm(false);
  };

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rose-800">✅ Tareas</h1>
          <p className="text-sm text-rose-400 mt-1">{completed}/{total} completadas</p>
        </div>
        <button onClick={openAdd} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Nueva tarea
        </button>
      </div>

      {total > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Progreso general</span>
            <span className="font-semibold text-rose-600">{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="w-full bg-rose-100 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-rose-400 to-rose-500 h-2.5 rounded-full transition-all"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            {f === 'all' ? `Todas (${total})` : f === 'pending' ? `Pendientes (${total - completed})` : `Completadas (${completed})`}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>{tasks.length === 0 ? 'Añade tu primera tarea' : 'No hay tareas en esta categoría'}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catTasks]) => (
          <div key={category} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{category}</h3>
            <div className="space-y-2">
              {[...catTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).map(task => (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                    task.completed ? 'border-gray-100 opacity-60' : 'border-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-rose-400 border-rose-400' : 'border-rose-300 hover:border-rose-500'
                      }`}
                    >
                      {task.completed && <span className="text-white text-xs leading-none">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-400">📅 {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(task)} className="text-gray-300 hover:text-rose-500 transition-colors">✏️</button>
                      <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-rose-700 mb-4">{editing ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <div className="space-y-3">
              <input
                className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Descripción de la tarea *"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.priority}
                  onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                >
                  <option value="high">🔴 Alta prioridad</option>
                  <option value="medium">🟡 Media prioridad</option>
                  <option value="low">🟢 Baja prioridad</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha límite (opcional)</label>
                <input
                  type="date"
                  className="w-full border border-rose-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  value={form.dueDate}
                  onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-rose-200 text-rose-600 py-2 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">
                {editing ? 'Guardar' : 'Añadir tarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
