'use client';

import { motion } from 'framer-motion';

interface MacroProps {
  current: number;
  goal: number;
}

interface MacroBreakdownProps {
  protein: MacroProps;
  carbs: MacroProps;
  fat: MacroProps;
}

export function MacroBreakdown({ protein, carbs, fat }: MacroBreakdownProps) {
  const macros = [
    { name: 'Protein', ...protein, color: 'bg-red-500', bgColor: 'bg-red-50', unit: 'g' },
    { name: 'Carbs', ...carbs, color: 'bg-blue-500', bgColor: 'bg-blue-50', unit: 'g' },
    { name: 'Fat', ...fat, color: 'bg-amber-500', bgColor: 'bg-amber-50', unit: 'g' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Macros</h3>
      <div className="space-y-4">
        {macros.map((macro) => {
          const percentage = Math.min(100, ((macro?.current ?? 0) / (macro?.goal ?? 1)) * 100);
          return (
            <div key={macro.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{macro.name}</span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {Math.round(macro?.current ?? 0)}{macro.unit} / {macro?.goal ?? 0}{macro.unit}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${macro.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
