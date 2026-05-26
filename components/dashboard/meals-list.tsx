'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Plus, Trash2, ImageIcon, Clock, Coffee, Salad, Cookie, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface MealsListProps {
  meals: any[];
  onUpdate: () => void;
}

const MEAL_TYPE_COLORS: Record<string, string> = {
  breakfast: 'bg-amber-50 text-amber-700',
  lunch: 'bg-emerald-50 text-emerald-700',
  dinner: 'bg-violet-50 text-violet-700',
  snack: 'bg-blue-50 text-blue-700',
};

const MEAL_TYPE_ICON: Record<string, LucideIcon> = {
  breakfast: Coffee,
  lunch: Salad,
  dinner: UtensilsCrossed,
  snack: Cookie,
};

const MEAL_TYPE_ICON_COLORS: Record<string, string> = {
  breakfast: 'text-amber-600',
  lunch: 'text-emerald-600',
  dinner: 'text-violet-600',
  snack: 'text-blue-600',
};

export function MealsList({ meals, onUpdate }: MealsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this meal?')) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Meal removed');
      onUpdate();
    } catch (error) {
      toast.error('Failed to remove meal');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Today&apos;s Meals</h3>
        <Link
          href="/meals/add"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Meal
        </Link>
      </div>

      {(meals ?? []).length === 0 ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-4">No meals logged yet today</p>
          <Link
            href="/meals/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Your First Meal
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {(meals ?? []).map((meal, index) => (
              <motion.div
                key={meal?.id ?? index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                {/* Meal image or icon */}
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {meal?.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal?.name ?? 'Meal'} className="w-full h-full object-cover" />
                  ) : (() => {
                    const Icon = MEAL_TYPE_ICON[meal?.mealType ?? 'snack'] ?? UtensilsCrossed;
                    const colorClass = MEAL_TYPE_ICON_COLORS[meal?.mealType ?? 'snack'] ?? 'text-gray-500';
                    return <Icon className={`w-5 h-5 ${colorClass}`} />;
                  })()}
                </div>

                {/* Meal info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900 truncate">{meal?.name ?? 'Unknown meal'}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${MEAL_TYPE_COLORS[meal?.mealType ?? 'snack'] ?? MEAL_TYPE_COLORS.snack}`}>
                      {(meal?.mealType ?? 'snack').charAt(0).toUpperCase() + (meal?.mealType ?? 'snack').slice(1)}
                    </span>
                    {meal?.isAIGenerated && (
                      <span className="text-[10px] text-violet-500 font-medium">AI</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(meal?.loggedAt ?? new Date().toISOString())}
                    </span>
                    <span className="tabular-nums">{meal?.calories ?? 0} cal</span>
                  </div>
                </div>

                {/* Macros preview */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="px-1.5 py-0.5 bg-red-50 rounded">P: {Math.round(meal?.protein ?? 0)}g</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 rounded">C: {Math.round(meal?.carbs ?? 0)}g</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 rounded">F: {Math.round(meal?.fat ?? 0)}g</span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(meal?.id)}
                  disabled={deleting === meal?.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
