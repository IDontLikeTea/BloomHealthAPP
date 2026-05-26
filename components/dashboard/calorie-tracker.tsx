'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Clock, Flame } from 'lucide-react';

interface CalorieTrackerProps {
  consumed: number;
  burned: number;
  goal: number;
  remaining: number;
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fat: { current: number; goal: number };
  customization: {
    shape: string;
    primaryColor: string;
    secondaryColor: string | null;
    useGradient: boolean;
  } | null;
}

type TabType = 'calories' | 'macros' | 'exercise';

export function CalorieTracker({ 
  consumed, 
  burned, 
  goal, 
  remaining, 
  protein,
  carbs,
  fat,
  customization 
}: CalorieTrackerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('calories');
  const [mounted, setMounted] = useState(false);
  
  const percentage = Math.min(100, (consumed / goal) * 100);
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderCircleProgress = () => (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl sm:text-5xl font-bold text-gray-900 tabular-nums"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {mounted ? consumed.toLocaleString() : '0'}
        </motion.span>
        <span className="text-sm text-gray-500 mt-1">of {goal.toLocaleString()} cal</span>
      </div>
    </div>
  );

  const renderMacrosContent = () => {
    const macros = [
      { name: 'Protein', current: protein.current, goal: protein.goal, color: '#EF4444', unit: 'g' },
      { name: 'Carbs', current: carbs.current, goal: carbs.goal, color: '#3B82F6', unit: 'g' },
      { name: 'Fat', current: fat.current, goal: fat.goal, color: '#F59E0B', unit: 'g' },
    ];

    return (
      <div className="space-y-5 py-4">
        {macros.map((macro) => {
          const percent = Math.min(100, (macro.current / macro.goal) * 100);
          return (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{macro.name}</span>
                <span className="text-gray-500 tabular-nums">{macro.current}{macro.unit} / {macro.goal}{macro.unit}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: macro.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderExerciseContent = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
        <Flame className="w-7 h-7 text-emerald-600" />
      </div>
      <motion.span 
        className="text-3xl font-bold text-gray-900"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {burned}
      </motion.span>
      <p className="text-sm text-gray-500 mt-1">Calories Burned</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {/* Tabs */}
      <div className="flex items-center justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {(['calories', 'macros', 'exercise'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'calories' && (
            <>
              {renderCircleProgress()}
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                    <Utensils className="w-3.5 h-3.5" />
                    <span className="text-xs">Eaten</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 tabular-nums">{consumed}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-xs">Burned</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 tabular-nums">{burned}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Left</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 tabular-nums">{remaining}</span>
                </div>
              </div>
            </>
          )}
          {activeTab === 'macros' && renderMacrosContent()}
          {activeTab === 'exercise' && renderExerciseContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
