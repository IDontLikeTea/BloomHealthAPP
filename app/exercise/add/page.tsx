'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Dumbbell, Save, Loader2, Clock, Flame, HeartPulse, StretchHorizontal, Trophy, Footprints, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const EXERCISE_TYPES: { id: string; label: string; icon: LucideIcon; examples: string }[] = [
  { id: 'cardio', label: 'Cardio', icon: HeartPulse, examples: 'Running, cycling, swimming' },
  { id: 'strength', label: 'Strength', icon: Dumbbell, examples: 'Weight lifting, resistance' },
  { id: 'flexibility', label: 'Flexibility', icon: StretchHorizontal, examples: 'Yoga, stretching, pilates' },
  { id: 'sports', label: 'Sports', icon: Trophy, examples: 'Tennis, basketball, soccer' },
  { id: 'other', label: 'Other', icon: Footprints, examples: 'Walking, dancing, housework' },
];

const INTENSITY_LEVELS = [
  { id: 'low', label: 'Light', description: 'Easy effort, can hold a conversation', multiplier: 3 },
  { id: 'moderate', label: 'Moderate', description: 'Somewhat hard, breathing heavier', multiplier: 5 },
  { id: 'high', label: 'Intense', description: 'Very hard, can\'t talk easily', multiplier: 8 },
];

export default function AddExercisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cardio',
    duration: '',
    intensity: 'moderate',
    notes: '',
  });

  // Estimate calories burned based on duration and intensity
  const estimatedCalories = () => {
    const duration = parseInt(formData.duration) || 0;
    const intensity = INTENSITY_LEVELS.find((i) => i.id === formData.intensity);
    return Math.round(duration * (intensity?.multiplier ?? 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.duration) {
      toast.error('Please enter exercise name and duration');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          caloriesBurned: estimatedCalories(),
        }),
      });

      if (!res.ok) throw new Error('Failed to log exercise');

      toast.success('Exercise logged! Your body thanks you 💪');
      // Use hard navigation to bypass Next.js router cache and get fresh server data
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to log exercise');
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
          <h1 className="text-xl font-semibold">Log Exercise</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-28 lg:pb-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6"
        >
          {/* Exercise Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">Exercise Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXERCISE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.type === type.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <type.icon className={`w-6 h-6 mb-2 mx-auto ${formData.type === type.id ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-medium block">{type.label}</span>
                  <span className={`text-xs ${formData.type === type.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {type.examples}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Activity Name</label>
            <div className="relative">
              <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="What exercise did you do?"
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Duration (minutes)</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">Intensity</label>
            <div className="grid grid-cols-3 gap-3">
              {INTENSITY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, intensity: level.id })}
                  className={`p-4 rounded-xl text-center transition-all ${
                    formData.intensity === level.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium block mb-1">{level.label}</span>
                  <span className={`text-xs ${formData.intensity === level.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {level.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Calories */}
          {formData.duration && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Flame className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated calories burned</p>
                  <p className="text-xs text-gray-500">Based on duration & intensity</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{estimatedCalories()}</span>
            </motion.div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How did this workout feel?"
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
                Log Exercise
              </>
            )}
          </button>
        </motion.form>
      </main>
    </div>
  );
}
