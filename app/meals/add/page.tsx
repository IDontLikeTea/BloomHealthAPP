'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, UtensilsCrossed, Save, Loader2, Sparkles, Clock, Coffee, Salad, Cookie } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', Icon: Coffee },
  { id: 'lunch', label: 'Lunch', Icon: Salad },
  { id: 'dinner', label: 'Dinner', Icon: UtensilsCrossed },
  { id: 'snack', label: 'Snack', Icon: Cookie },
];

// Get suggested meal type based on current hour
function getSuggestedMealType(hour: number): string {
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 17 && hour < 21) return 'dinner';
  return 'snack';
}

// Format current time as HH:MM for the time input
function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function AddMealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mealType: 'snack',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: '',
    time: '12:00',
  });

  // Set initial meal type and time based on current time (client-side only)
  useEffect(() => {
    const now = new Date();
    const suggestedType = getSuggestedMealType(now.getHours());
    const currentTime = getCurrentTime();
    setFormData(prev => ({
      ...prev,
      mealType: suggestedType,
      time: currentTime,
    }));
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.calories) {
      toast.error('Please enter meal name and calories');
      return;
    }

    // Create loggedAt datetime from the time input
    const [hours, minutes] = formData.time.split(':').map(Number);
    const loggedAt = new Date();
    loggedAt.setHours(hours, minutes, 0, 0);

    setLoading(true);
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          loggedAt: loggedAt.toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to log meal');

      toast.success('Meal logged successfully');
      // Use hard navigation to bypass Next.js router cache and get fresh server data
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold">Log Meal</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-28 lg:pb-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6"
        >
          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                value={mounted ? formData.time : '12:00'}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">Meal Type</label>
            <div className="grid grid-cols-4 gap-3">
              {MEAL_TYPES.map((type) => {
                const Icon = type.Icon;
                const active = formData.mealType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, mealType: type.id })}
                    className={`p-3 rounded-xl text-center transition-all flex flex-col items-center gap-1.5 ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Meal Name</label>
            <div className="relative">
              <UtensilsCrossed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="What did you eat?"
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Calories */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Calories</label>
            <input
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="Estimated calories"
              className="input-field"
            />
          </div>

          {/* Macros */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">Macros (optional)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  placeholder="0"
                  className="input-field text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  placeholder="0"
                  className="input-field text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  placeholder="0"
                  className="input-field text-center"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How did this meal make you feel?"
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Log Meal
              </>
            )}
          </button>
        </motion.form>

        {/* AI Scan Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 text-sm mb-3">Or let AI help you</p>
          <Link
            href="/meals/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Scan Meal with AI
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
