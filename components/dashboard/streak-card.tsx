'use client';

import { motion } from 'framer-motion';
import { Flame, Droplets, Dumbbell } from 'lucide-react';

interface StreakCardProps {
  streaks: any[];
}

const STREAK_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
  meal_logging: {
    icon: Flame,
    label: 'Meal Logging',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  water: {
    icon: Droplets,
    label: 'Hydration',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  exercise: {
    icon: Dumbbell,
    label: 'Exercise',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
};

export function StreakCard({ streaks }: StreakCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        Streaks
      </h3>

      <div className="space-y-3">
        {(streaks ?? []).map((streak, index) => {
          const config = STREAK_CONFIG[streak?.type ?? 'meal_logging'] ?? STREAK_CONFIG.meal_logging;
          const Icon = config.icon;
          
          return (
            <motion.div
              key={streak?.id ?? index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-9 h-9 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{config.label}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {streak?.count ?? 0}
                </span>
                <p className="text-[10px] text-gray-500">days</p>
              </div>
            </motion.div>
          );
        })}

        {(streaks ?? []).length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Start logging to build streaks</p>
        )}
      </div>
    </div>
  );
}
