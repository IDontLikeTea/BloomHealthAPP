'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { CalorieTracker } from './calorie-tracker';
import { MacroBreakdown } from './macro-breakdown';
import { MealsList } from './meals-list';
import { WaterTracker } from './water-tracker';
import { StreakCard } from './streak-card';
import { QuickActions } from './quick-actions';
import { AICompanionWidget } from './ai-companion-widget';
import { ThemeProvider } from '@/lib/theme-context';
import { CelebrationModal } from '@/components/ui/celebration-modal';
import { BloomSupportPopup } from '@/components/ui/bloom-support-popup';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface DashboardClientProps {
  initialData: {
    profile: any;
    aiCompanion: any;
    trackerCustomization: any;
    streaks: any[];
    todayMeals: any[];
    todayExercises: any[];
    todayWater: any[];
    userName: string;
    compassionateMode: boolean;
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const {
    profile,
    aiCompanion,
    trackerCustomization,
    streaks,
    todayMeals,
    todayExercises,
    todayWater,
    userName,
    compassionateMode,
  } = initialData;

  const [meals, setMeals] = useState(todayMeals ?? []);
  const [exercises, setExercises] = useState(todayExercises ?? []);
  const [waterLogs, setWaterLogs] = useState(todayWater ?? []);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ title: '', message: '', type: 'goal' as const });
  const hasShownGoalCelebration = useRef(false);
  
  const [showBloomSupport, setShowBloomSupport] = useState(false);
  const [bloomSupportType, setBloomSupportType] = useState<'undereating' | 'overeating' | 'binge' | 'low_goal' | null>(null);
  const lastShownSeverity = useRef<string | null>(null);

  useKeyboardShortcuts();

  // Refresh on mount AND when page becomes visible (tab focus/navigation back)
  useEffect(() => {
    // Refresh immediately on mount
    refreshData();

    // Also refresh when page becomes visible (tab focus, navigation back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCalories = (meals ?? []).reduce((sum: number, m: any) => sum + (m?.calories ?? 0), 0);
  const caloriesBurned = (exercises ?? []).reduce((sum: number, e: any) => sum + (e?.caloriesBurned ?? 0), 0);
  const netCalories = totalCalories - caloriesBurned;
  const calorieGoal = profile?.dailyCalorieGoal ?? 2000;
  const caloriesRemaining = Math.max(0, calorieGoal - netCalories);

  const totalProtein = (meals ?? []).reduce((sum: number, m: any) => sum + (m?.protein ?? 0), 0);
  const totalCarbs = (meals ?? []).reduce((sum: number, m: any) => sum + (m?.carbs ?? 0), 0);
  const totalFat = (meals ?? []).reduce((sum: number, m: any) => sum + (m?.fat ?? 0), 0);

  const totalWater = (waterLogs ?? []).reduce((sum: number, w: any) => sum + (w?.amount ?? 0), 0);
  const waterGoal = profile?.dailyWaterGoal ?? 2000;

  useEffect(() => {
    const goalPercentage = (netCalories / calorieGoal) * 100;
    if (goalPercentage >= 90 && goalPercentage <= 110 && !hasShownGoalCelebration.current && meals.length > 0) {
      hasShownGoalCelebration.current = true;
      setCelebrationData({
        title: 'Goal Reached!',
        message: "You've hit your calorie goal for today. Well done.",
        type: 'goal',
      });
      setShowCelebration(true);
    }
  }, [netCalories, calorieGoal, meals.length]);

  useEffect(() => {
    if (showCelebration) return;
    
    const goalPercentage = (netCalories / calorieGoal) * 100;
    const currentHour = new Date().getHours();
    const isDangerouslyLowGoal = calorieGoal < 1200;
    const isUndereating = (
      (currentHour >= 14 && goalPercentage < 40 && meals.length > 0) ||
      (currentHour >= 18 && goalPercentage < 60 && meals.length > 0)
    );
    // Distinguish mild overeating (110-150%) from a binge (>150%)
    // These are psychologically very different experiences
    const isMildOvereating = goalPercentage > 110 && goalPercentage <= 150 && meals.length > 0;
    const isBinge = goalPercentage > 150 && meals.length > 0;

    // Determine what severity we'd show now
    let newSeverity: typeof bloomSupportType = null;
    if (compassionateMode) {
      if (isDangerouslyLowGoal) newSeverity = 'low_goal';
      else if (isUndereating) newSeverity = 'undereating';
      else if (isBinge) newSeverity = 'binge';
      else if (isMildOvereating) newSeverity = 'overeating';
    } else {
      if (isBinge) newSeverity = 'binge';
      else if (isMildOvereating) newSeverity = 'overeating';
    }

    // Skip if nothing to show, or if we already showed this exact severity
    // Exception: always upgrade from 'overeating' to 'binge' — they need different support
    if (!newSeverity) return;
    const alreadyShown = lastShownSeverity.current === newSeverity;
    const isUpgrade = lastShownSeverity.current === 'overeating' && newSeverity === 'binge';
    if (alreadyShown && !isUpgrade) return;
    
    const timer = setTimeout(() => {
      // Re-check: allow if upgrading to binge or showing for first time
      const shouldShow = lastShownSeverity.current !== newSeverity || isUpgrade;
      if (!shouldShow) return;

      lastShownSeverity.current = newSeverity;
      setBloomSupportType(newSeverity);
      setShowBloomSupport(true);
    }, lastShownSeverity.current === null ? 3000 : 1500);

    return () => clearTimeout(timer);
  }, [netCalories, calorieGoal, meals.length, showCelebration, compassionateMode]);

  const handleDismissBloomSupport = () => {
    setShowBloomSupport(false);
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/dashboard/today');
      if (res.ok) {
        const data = await res.json();
        setMeals(data?.meals ?? []);
        setExercises(data?.exercises ?? []);
        setWaterLogs(data?.waterLogs ?? []);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        
        <div className="lg:ml-60">
          <Header
            userName={userName}
            companionName={aiCompanion?.name ?? 'Bloom'}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <main className="p-4 lg:p-6 pb-28 lg:pb-6">
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CalorieTracker
                    consumed={totalCalories}
                    burned={caloriesBurned}
                    goal={calorieGoal}
                    remaining={caloriesRemaining}
                    protein={{ current: totalProtein, goal: profile?.dailyProteinGoal ?? 100 }}
                    carbs={{ current: totalCarbs, goal: profile?.dailyCarbsGoal ?? 200 }}
                    fat={{ current: totalFat, goal: profile?.dailyFatGoal ?? 65 }}
                    customization={trackerCustomization}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MacroBreakdown
                    protein={{ current: totalProtein, goal: profile?.dailyProteinGoal ?? 100 }}
                    carbs={{ current: totalCarbs, goal: profile?.dailyCarbsGoal ?? 200 }}
                    fat={{ current: totalFat, goal: profile?.dailyFatGoal ?? 65 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MealsList meals={meals} onUpdate={refreshData} />
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AICompanionWidget
                    companionName={aiCompanion?.name ?? 'Bloom'}
                    netCalories={netCalories}
                    calorieGoal={calorieGoal}
                    compassionateMode={compassionateMode}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <WaterTracker
                    current={totalWater}
                    goal={waterGoal}
                    onLog={refreshData}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <StreakCard streaks={streaks ?? []} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <QuickActions onAction={refreshData} />
                </motion.div>

                {/* Keyboard Shortcuts */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="hidden lg:block bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shortcuts</h4>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">⌘M</kbd> Log Meal</p>
                    <p><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">⌘E</kbd> Log Exercise</p>
                    <p><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">⌘S</kbd> Scan Meal</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>

        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          title={celebrationData.title}
          message={celebrationData.message}
          type={celebrationData.type}
        />

        {showBloomSupport && (
          <BloomSupportPopup
            companionName={aiCompanion?.name ?? 'Bloom'}
            netCalories={netCalories}
            calorieGoal={calorieGoal}
            onDismiss={handleDismissBloomSupport}
            type={bloomSupportType}
            compassionateMode={compassionateMode}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
