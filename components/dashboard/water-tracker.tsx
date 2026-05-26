'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface WaterTrackerProps {
  current: number;
  goal: number;
  onLog: () => void;
}

export function WaterTracker({ current, goal, onLog }: WaterTrackerProps) {
  const [logging, setLogging] = useState(false);
  const percentage = Math.min(100, ((current ?? 0) / (goal ?? 1)) * 100);
  const glasses = Math.floor((current ?? 0) / 250);
  const goalGlasses = Math.ceil((goal ?? 2000) / 250);

  const logWater = async (amount: number) => {
    setLogging(true);
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error('Failed to log water');
      toast.success(amount > 0 ? 'Water logged' : 'Water removed');
      onLog();
    } catch (error) {
      toast.error('Failed to log water');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          Hydration
        </h3>
        <span className="text-xs text-gray-500 tabular-nums">
          {Math.round(current ?? 0)}ml / {goal ?? 2000}ml
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <p className="text-center text-sm text-gray-600 mb-4">
        <span className="font-semibold text-gray-900">{glasses}</span> / {goalGlasses} glasses
      </p>

      {/* Quick add buttons */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => logWater(-250)}
          disabled={logging || (current ?? 0) <= 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={() => logWater(250)}
          disabled={logging}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          250ml
        </button>

        <button
          onClick={() => logWater(500)}
          disabled={logging}
          className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-600 transition-colors"
        >
          +500ml
        </button>
      </div>
    </div>
  );
}
