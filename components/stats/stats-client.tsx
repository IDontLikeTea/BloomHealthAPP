'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Flame, Droplets, Dumbbell, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

interface StatsClientProps {
  profile: any;
  meals: any[];
  exercises: any[];
  waterLogs: any[];
  streaks: any[];
}

export function StatsClient({ profile, meals, exercises, waterLogs, streaks }: StatsClientProps) {
  // Process data for charts
  const chartData = useMemo(() => {
    const days: Record<string, any> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0] ?? '';
      days[key] = {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: 0,
        burned: 0,
        water: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    (meals ?? []).forEach((meal: any) => {
      const key = new Date(meal?.loggedAt ?? new Date()).toISOString().split('T')[0] ?? '';
      if (days[key]) {
        days[key].calories += meal?.calories ?? 0;
        days[key].protein += meal?.protein ?? 0;
        days[key].carbs += meal?.carbs ?? 0;
        days[key].fat += meal?.fat ?? 0;
      }
    });

    (exercises ?? []).forEach((exercise: any) => {
      const key = new Date(exercise?.loggedAt ?? new Date()).toISOString().split('T')[0] ?? '';
      if (days[key]) {
        days[key].burned += exercise?.caloriesBurned ?? 0;
      }
    });

    (waterLogs ?? []).forEach((log: any) => {
      const key = new Date(log?.loggedAt ?? new Date()).toISOString().split('T')[0] ?? '';
      if (days[key]) {
        days[key].water += log?.amount ?? 0;
      }
    });

    return Object.values(days);
  }, [meals, exercises, waterLogs]);

  const avgCalories = Math.round(
    (chartData ?? []).reduce((sum: number, d: any) => sum + (d?.calories ?? 0), 0) / ((chartData ?? []).length || 1)
  );
  const avgBurned = Math.round(
    (chartData ?? []).reduce((sum: number, d: any) => sum + (d?.burned ?? 0), 0) / ((chartData ?? []).length || 1)
  );
  const avgWater = Math.round(
    (chartData ?? []).reduce((sum: number, d: any) => sum + (d?.water ?? 0), 0) / ((chartData ?? []).length || 1)
  );

  const calorieGoal = profile?.dailyCalorieGoal ?? 2000;
  const waterGoal = profile?.dailyWaterGoal ?? 2000;

  const statCards = [
    {
      icon: Flame,
      label: 'Avg Calories',
      value: avgCalories,
      unit: 'kcal',
      target: calorieGoal,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Dumbbell,
      label: 'Avg Burned',
      value: avgBurned,
      unit: 'kcal',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Droplets,
      label: 'Avg Water',
      value: avgWater,
      unit: 'ml',
      target: waterGoal,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Calendar,
      label: 'Days Tracked',
      value: (chartData ?? []).filter((d: any) => (d?.calories ?? 0) > 0).length,
      unit: 'days',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
  ];

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Your Progress
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-28 lg:pb-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {stat.value}
                <span className="text-sm font-normal text-gray-400 ml-1">{stat.unit}</span>
              </p>
              {stat.target && (
                <p className="text-xs text-gray-400">Goal: {stat.target}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Calorie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">Calorie Intake (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData ?? []}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCalories)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Macros Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-4">Macro Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData ?? []}>
                <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="protein" stackId="a" fill="#ef4444" name="Protein (g)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="carbs" stackId="a" fill="#3b82f6" name="Carbs (g)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fat" stackId="a" fill="#f59e0b" name="Fat (g)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-sm text-gray-600">Protein</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm text-gray-600">Carbs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-sm text-gray-600">Fat</span>
            </div>
          </div>
        </motion.div>

        {/* Water & Exercise */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              Water Intake
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData ?? []}>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              Calories Burned
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData ?? []}>
                  <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="burned" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-emerald-600 rounded-xl shadow-sm p-6 text-white text-center"
        >
          <h3 className="text-lg font-semibold mb-2">Keep going</h3>
          <p className="text-white/85 text-sm">
            Every small step counts. Your commitment to tracking is a quiet act of self-care.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
