'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Trash2, Clock, Flame, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ExerciseListProps {
  exercises: any[];
}

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  cardio: 'Cardio',
  strength: 'Strength',
  flexibility: 'Flexibility',
  sports: 'Sports',
  other: 'Other',
};

export function ExerciseList({ exercises: initialExercises }: ExerciseListProps) {
  const [exercises, setExercises] = useState(initialExercises ?? []);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this exercise?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/exercise/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setExercises((exercises ?? []).filter((e: any) => e?.id !== id));
      toast.success('Exercise removed');
    } catch (error) {
      toast.error('Failed to remove exercise');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const groupedExercises = (exercises ?? []).reduce((groups: Record<string, any[]>, exercise: any) => {
    const date = new Date(exercise?.loggedAt ?? new Date()).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(exercise);
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Exercise Log</h1>
          </div>
          <Link href="/exercise/add" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">
            <Plus className="w-4 h-4" />
            Log Exercise
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-28 lg:pb-6">
        {(exercises ?? []).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No exercises logged</h2>
            <p className="text-gray-500 text-sm mb-6">Start tracking your workouts</p>
            <Link href="/exercise/add" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Log Exercise
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedExercises).map(([date, dateExercises]) => (
              <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {formatDate((dateExercises as any)?.[0]?.loggedAt ?? new Date().toISOString())}
                </h3>
                <div className="space-y-2">
                  <AnimatePresence>
                    {((dateExercises as any[]) ?? []).map((exercise: any, index: number) => (
                      <motion.div key={exercise?.id ?? index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{exercise?.name ?? 'Exercise'}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-0.5 tabular-nums">
                              <Clock className="w-3 h-3" />
                              {formatTime(exercise?.loggedAt ?? new Date().toISOString())}
                            </span>
                            <span className="tabular-nums">{exercise?.duration ?? 0} min</span>
                            <span className="flex items-center gap-0.5 tabular-nums">
                              <Flame className="w-3 h-3" />{exercise?.caloriesBurned ?? 0} cal
                            </span>
                            <span className="capitalize">{exercise?.intensity ?? 'moderate'}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(exercise?.id)} disabled={deleting === exercise?.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
