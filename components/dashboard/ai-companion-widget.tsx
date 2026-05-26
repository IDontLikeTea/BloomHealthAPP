'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AICompanionWidgetProps {
  companionName: string;
  netCalories: number;
  calorieGoal: number;
  compassionateMode?: boolean;
}

export function AICompanionWidget({ companionName, netCalories, calorieGoal, compassionateMode = true }: AICompanionWidgetProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const progress = (netCalories ?? 0) / (calorieGoal ?? 1);
    
    const isBinge = progress > 1.5;
    const isMildOver = progress > 1.1 && progress <= 1.5;

    if (compassionateMode) {
      if (progress < 0.3) {
        setMessage('Remember to nourish yourself today. Your body deserves good fuel.');
      } else if (progress >= 0.3 && progress < 0.7) {
        setMessage('Good progress so far. Keep making mindful choices.');
      } else if (progress >= 0.7 && progress < 1) {
        setMessage('Almost at your daily target. You\'re doing well.');
      } else if (progress >= 1 && !isMildOver && !isBinge) {
        setMessage('Daily goal reached. Listen to your body\'s signals.');
      } else if (isMildOver) {
        setMessage('A bit over today — totally normal. Your body knows how to handle this.');
      } else if (isBinge) {
        setMessage('Today was tough. I\'m here if you want to talk. No judgment, just support.');
      }
    } else {
      if (progress < 0.3) {
        setMessage(`${Math.round(progress * 100)}% of daily goal. ${calorieGoal - netCalories} kcal remaining.`);
      } else if (progress >= 0.3 && progress < 0.7) {
        setMessage(`On track. ${calorieGoal - netCalories} kcal remaining today.`);
      } else if (progress >= 0.7 && progress < 1) {
        setMessage(`Approaching limit. ${calorieGoal - netCalories} kcal left.`);
      } else if (progress >= 1 && !isMildOver && !isBinge) {
        setMessage('Daily goal reached. Be mindful of additional intake.');
      } else if (isMildOver) {
        setMessage(`Over by ${netCalories - calorieGoal} kcal. Minor — stay on plan for the rest of today.`);
      } else if (isBinge) {
        setMessage('Significantly over target. Resume normal eating tomorrow — do not restrict.');
      }
    }
  }, [netCalories, calorieGoal, compassionateMode]);

  return (
    <div className="bg-gray-900 rounded-xl p-5 text-white">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{companionName ?? 'Bloom'}</h3>
          <p className="text-xs text-gray-400">AI Assistant</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mb-4">{message}</p>

      <Link
        href="/companion"
        className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg transition-colors text-xs font-medium"
      >
        Chat with {companionName ?? 'Bloom'}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
