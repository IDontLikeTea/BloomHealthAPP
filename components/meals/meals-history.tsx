'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Plus, Trash2, Camera, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface MealsHistoryProps {
  meals: any[];
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-50 text-amber-700',
  lunch: 'bg-emerald-50 text-emerald-700',
  dinner: 'bg-violet-50 text-violet-700',
  snack: 'bg-blue-50 text-blue-700',
};

export function MealsHistory({ meals: initialMeals }: MealsHistoryProps) {
  const [meals, setMeals] = useState(initialMeals ?? []);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this meal?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setMeals((meals ?? []).filter((m: any) => m?.id !== id));
      toast.success('Meal removed');
    } catch (error) {
      toast.error('Failed to remove meal');
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

  const groupedMeals = (meals ?? []).reduce((groups: Record<string, any[]>, meal: any) => {
    const date = new Date(meal?.loggedAt ?? new Date()).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(meal);
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
            <h1 className="text-lg font-semibold text-gray-900">Meal History</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/meals/scan" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Camera className="w-4 h-4" />
            </Link>
            <Link href="/meals/add" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">
              <Plus className="w-4 h-4" />
              Add Meal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-28 lg:pb-6">
        {(meals ?? []).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No meals logged yet</h2>
            <p className="text-gray-500 text-sm mb-6">Start tracking your nutrition</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/meals/scan" className="btn-secondary flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4" /> Scan Meal
              </Link>
              <Link href="/meals/add" className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Log Meal
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMeals).map(([date, dateMeals]) => {
              const dailyCalories = ((dateMeals as any[]) ?? []).reduce((sum: number, m: any) => sum + (m?.calories ?? 0), 0);
              return (
                <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {formatDate((dateMeals as any)?.[0]?.loggedAt ?? new Date().toISOString())}
                    </h3>
                    <span className="text-xs text-emerald-600 font-medium tabular-nums">{dailyCalories} cal</span>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {((dateMeals as any[]) ?? []).map((meal: any, index: number) => (
                        <motion.div key={meal?.id ?? index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm text-gray-900">{meal?.name ?? 'Meal'}</p>
                              {meal?.isAIGenerated && <span className="text-[10px] text-violet-500 font-medium">AI</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${MEAL_TYPE_COLORS[meal?.mealType ?? 'snack'] ?? MEAL_TYPE_COLORS.snack}`}>
                                {(meal?.mealType ?? 'snack').charAt(0).toUpperCase() + (meal?.mealType ?? 'snack').slice(1)}
                              </span>
                              <span className="flex items-center gap-0.5 tabular-nums">
                                <Clock className="w-3 h-3" />
                                {formatTime(meal?.loggedAt ?? new Date().toISOString())}
                              </span>
                              <span className="tabular-nums">{meal?.calories ?? 0} cal</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-500">
                            <span className="px-1.5 py-0.5 bg-red-50 rounded">P: {Math.round(meal?.protein ?? 0)}g</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 rounded">C: {Math.round(meal?.carbs ?? 0)}g</span>
                            <span className="px-1.5 py-0.5 bg-amber-50 rounded">F: {Math.round(meal?.fat ?? 0)}g</span>
                          </div>
                          <button onClick={() => handleDelete(meal?.id)} disabled={deleting === meal?.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
