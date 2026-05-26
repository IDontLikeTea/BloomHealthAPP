'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MessageCircle, AlertTriangle, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BloomSupportPopupProps {
  companionName: string;
  netCalories: number;
  calorieGoal: number;
  onDismiss: () => void;
  type: 'undereating' | 'overeating' | 'binge' | 'low_goal' | null;
  compassionateMode?: boolean;
}

const UNDEREATING_MESSAGES = [
  {
    title: "Hey there, friend",
    message: "I noticed you might not have eaten much today. Your body is doing so much for you — it deserves some nourishment. How about a gentle snack?",
    tip: "Even a small, nutritious bite can make a difference."
  },
  {
    title: "Checking in with you",
    message: "It looks like you're running a bit low on fuel today. Eating well is an act of self-care, not something to feel guilty about.",
    tip: "Your body works hard for you — show it some love."
  },
  {
    title: "A gentle reminder",
    message: "Your calories are quite low today. There's no judgment here, just care. When you're ready, try something that sounds good to you.",
    tip: "Progress isn't about perfection — it's about nourishing yourself."
  },
];

const LOW_GOAL_MESSAGES = [
  {
    title: "I care about you",
    message: "Your calorie goal is set quite low. Eating too few calories can slow your metabolism and leave you feeling drained. You deserve to feel energized.",
    tip: "Most adults need at least 1,200 kcal daily for basic body functions. Consider raising your goal."
  },
  {
    title: "A word from your companion",
    message: "Your current calorie target might not give your body enough fuel to thrive. Restricting too much can affect your mood, energy, and even your sleep.",
    tip: "Try adjusting your goal in Settings — nourishment is self-care."
  },
  {
    title: "Let's talk",
    message: "Setting your calories very low might seem like a shortcut, but your body needs proper fuel to stay healthy. Undereating can lead to fatigue and nutrient deficiencies.",
    tip: "A gentle, sustainable goal helps you feel your best."
  },
];

const OVEREATING_MESSAGES = [
  {
    title: "No worries, friend",
    message: "Today had a bit extra — and that's completely okay. Bodies aren't machines, and some days we need more. Be kind to yourself.",
    tip: "Tomorrow is a fresh start. Maybe a gentle walk tonight?"
  },
  {
    title: "I'm here for you",
    message: "Going over your goal doesn't define you. Life happens — celebrations, stress, cravings. What matters is how you feel.",
    tip: "One day doesn't undo your progress. You're doing great."
  },
  {
    title: "Hey, it's alright",
    message: "So you ate a bit more today? Your worth isn't measured in calories. Treat yourself with the same kindness you'd show a friend.",
    tip: "Focus on how foods make you feel, not just the numbers."
  },
];

// Binge messages (>150% of goal) — psychologically distinct from mild overeating
// Focus: grounding, breaking shame-binge cycle, zero mention of restriction
const BINGE_MESSAGES = [
  {
    title: "I see you, and I'm here",
    message: "Today was a lot. Bingeing can feel overwhelming and isolating, but it doesn't define you or your journey. What you're feeling right now will pass. You are not broken.",
    tip: "Right now, try one grounding thing: a glass of water, a slow breath, or just stepping outside for a moment."
  },
  {
    title: "You're safe here",
    message: "Bingeing often comes from something deeper — stress, emotions, restriction. This isn't a willpower failure. It's your body communicating something. Let's listen, not punish.",
    tip: "Be gentle tonight. No skipping meals tomorrow — that starts the cycle over. Eat normally when you're next hungry."
  },
  {
    title: "This moment doesn't erase your progress",
    message: "A binge can make everything feel undone, but that's not how bodies work. One difficult day in a long journey changes very little. What matters most is what happens next — and \"next\" can start with kindness.",
    tip: "Try not to compensate tomorrow. Eat regular meals, drink water, and let your body reset on its own."
  },
];

// Strict mode binge messages — direct but still responsible (no shaming)
const STRICT_BINGE_MESSAGES = [
  {
    title: "Significant Calorie Surplus",
    message: "Your intake today is well above your target. Occasional spikes happen, but if this is a recurring pattern, it may be worth exploring triggers — stress, skipped meals, or overly restrictive goals.",
    tip: "Resume normal eating tomorrow. Do not skip meals to compensate — that fuels the cycle."
  },
  {
    title: "Major Overshoot Detected",
    message: "Today's intake significantly exceeds your goal. A single day won't derail your progress, but understanding why it happened will help prevent repeats.",
    tip: "Reflect on what led to this: Were you overly hungry? Stressed? Your goal may need adjusting."
  },
  {
    title: "Well Over Daily Target",
    message: "Your calories are substantially over budget today. The most effective response is to return to your normal plan tomorrow — not to restrict further.",
    tip: "Restriction after a binge creates a restrict-binge cycle. Eat normally tomorrow."
  },
];

const STRICT_OVEREATING_MESSAGES = [
  {
    title: "Over Calorie Limit",
    message: "You have exceeded your daily calorie goal. Going over your target consistently will prevent you from reaching your goals.",
    tip: "Be more mindful of portion sizes for the rest of the day."
  },
  {
    title: "Daily Goal Exceeded",
    message: "Your calorie intake has surpassed your set limit. To stay on track, be more mindful of portion sizes.",
    tip: "Log everything accurately and stick to your planned meals for the rest of the day."
  },
  {
    title: "Calorie Surplus",
    message: "You've gone over your daily calorie budget. This will set back your progress if it becomes a pattern.",
    tip: "Review your meals today and identify where you can make adjustments."
  },
];

export function BloomSupportPopup({ 
  companionName, 
  netCalories, 
  calorieGoal, 
  onDismiss, 
  type,
  compassionateMode = true 
}: BloomSupportPopupProps) {
  const [messageData, setMessageData] = useState<{ title: string; message: string; tip: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const pick = (arr: typeof UNDEREATING_MESSAGES) => arr[Math.floor(Math.random() * arr.length)];

    if (compassionateMode) {
      if (type === 'low_goal') setMessageData(pick(LOW_GOAL_MESSAGES));
      else if (type === 'undereating') setMessageData(pick(UNDEREATING_MESSAGES));
      else if (type === 'binge') setMessageData(pick(BINGE_MESSAGES));
      else if (type === 'overeating') setMessageData(pick(OVEREATING_MESSAGES));
    } else {
      if (type === 'binge') setMessageData(pick(STRICT_BINGE_MESSAGES));
      else if (type === 'overeating') setMessageData(pick(STRICT_OVEREATING_MESSAGES));
    }
  }, [type, compassionateMode]);

  if (!mounted || !type || !messageData) return null;

  const percentage = Math.round((netCalories / calorieGoal) * 100);
  const isStrict = !compassionateMode;
  const isBinge = type === 'binge';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-4 bottom-24 lg:bottom-8 z-50 w-80 max-w-[calc(100vw-2rem)]"
      >
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border ${
          isBinge && !isStrict ? 'border-blue-200' : isStrict ? 'border-red-200' : 'border-gray-200'
        }`}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isBinge && !isStrict ? 'bg-blue-50' : isStrict ? 'bg-red-50' : 'bg-emerald-50'
              }`}>
                {isStrict && !isBinge ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : isBinge ? (
                  <Heart className={`w-4 h-4 ${isStrict ? 'text-red-600' : 'text-blue-600'}`} />
                ) : (
                  <Heart className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {isBinge && !isStrict ? (companionName || 'Sage') : isStrict ? 'Health Alert' : (companionName || 'Sage')}
                </p>
                <p className="text-xs text-gray-500">
                  {isBinge && !isStrict ? 'Here for you' : isStrict ? 'Daily limit exceeded' : 'AI Assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-base">
              {messageData.title}
            </h4>
            
            <p className="text-sm leading-relaxed text-gray-600">
              {messageData.message}
            </p>

            {/* Progress / context */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {type === 'low_goal' 
                ? `Current goal: ${calorieGoal} kcal/day`
                : `Currently at ${percentage}% of daily goal (${netCalories} / ${calorieGoal} kcal)`
              }
            </div>

            {/* Tip */}
            <div className={`p-3 rounded-lg text-sm border-l-2 ${
              isBinge && !isStrict
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : isStrict
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              <span className="font-medium">{isStrict ? 'Action: ' : 'Tip: '}</span>
              <span>{messageData.tip}</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              {type === 'low_goal' && !isStrict && (
                <Link
                  href="/settings"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 text-gray-900 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Adjust Goal in Settings
                </Link>
              )}
              {isBinge ? (
                /* Binge always offers companion support, even in strict mode */
                <Link
                  href="/companion"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
                    isStrict ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Talk to {companionName || 'Sage'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isStrict ? (
                <button
                  onClick={onDismiss}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Got it
                </button>
              ) : (
                <Link
                  href="/companion"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with {companionName || 'Sage'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
