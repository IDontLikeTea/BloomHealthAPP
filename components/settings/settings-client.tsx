'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MessageSquare, Bell, Save, Loader2, Shield, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ThemeProvider } from '@/lib/theme-context';

interface SettingsClientProps {
  profile: any;
  aiCompanion: any;
  trackerCustomization: any;
  notificationSettings: any;
  userName: string;
  userEmail: string;
}

function SettingsContent({
  profile,
  aiCompanion,
  trackerCustomization,
  notificationSettings,
  userName,
  userEmail,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [companionName, setCompanionName] = useState(aiCompanion?.name ?? 'Bloom');
  const [tracker] = useState({
    shape: 'circle',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    useGradient: false,
  });
  const [notifications, setNotifications] = useState({
    mealReminders: notificationSettings?.mealReminders ?? true,
    waterReminders: notificationSettings?.waterReminders ?? true,
    exerciseReminders: notificationSettings?.exerciseReminders ?? true,
  });
  const [useMetric, setUseMetric] = useState(profile?.useMetric ?? true);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(profile?.dailyCalorieGoal ?? 2000);
  const [compassionateMode, setCompassionateMode] = useState(profile?.compassionateMode ?? true);

  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };
  const kgToLbs = (kg: number) => Math.round(kg * 2.205);
  const getDisplayHeight = () => {
    const height = profile?.height;
    if (!height) return '-';
    return useMetric ? `${Math.round(height)} cm` : cmToFeetInches(height);
  };
  const getDisplayWeight = () => {
    const weight = profile?.weight;
    if (!weight) return '-';
    return useMetric ? `${Math.round(weight)} kg` : `${kgToLbs(weight)} lbs`;
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiCompanion: { name: companionName },
          trackerCustomization: tracker,
          profile: { useMetric, dailyCalorieGoal, compassionateMode },
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Settings saved');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'companion', label: 'AI Assistant', icon: MessageSquare },
    { id: 'notifications', label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-28 lg:pb-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-1.5 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap flex-shrink-0 md:w-full text-sm ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Profile</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Name</label>
                      <input type="text" value={userName} disabled className="input-field bg-gray-50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                      <input type="email" value={userEmail} disabled className="input-field bg-gray-50 text-sm" />
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-1">Units</p>
                      <p className="text-xs text-gray-500 mb-3">Choose your preferred measurement units</p>
                      <div className="flex gap-2">
                        <button onClick={() => setUseMetric(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${useMetric ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Metric (cm/kg)</button>
                        <button onClick={() => setUseMetric(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!useMetric ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Imperial (ft/lbs)</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Height</label>
                        <input type="text" value={getDisplayHeight()} disabled className="input-field bg-gray-50 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Weight</label>
                        <input type="text" value={getDisplayWeight()} disabled className="input-field bg-gray-50 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Goal</label>
                      <input type="text" value={(profile?.goalType ?? 'wellness').replace('_', ' ')} disabled className="input-field bg-gray-50 capitalize text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Daily Calorie Goal</label>
                      <div className="relative">
                        <input type="number" min="1000" max="5000" step="50" value={dailyCalorieGoal} onChange={(e) => setDailyCalorieGoal(parseInt(e.target.value) || 2000)} className="input-field pr-14 text-sm" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kcal</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Range: 1000–5000 kcal</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'companion' && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-5">AI Assistant</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Assistant Name</label>
                      <input type="text" value={companionName} onChange={(e) => setCompanionName(e.target.value)} placeholder="Bloom" className="input-field text-sm" maxLength={20} />
                      <p className="text-xs text-gray-400 mt-1">This name will be used in conversations</p>
                    </div>

                    <div className="p-4 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-white text-sm">{companionName || 'Bloom'}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {compassionateMode
                          ? `"I'm here to support your wellness journey with personalized guidance."`
                          : `"I'll provide direct, data-driven feedback on your progress."`
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Feedback Style</label>
                      <p className="text-xs text-gray-400 mb-3">Choose how {companionName || 'Bloom'} communicates with you</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => setCompassionateMode(true)}
                          className={`p-4 rounded-lg text-left transition-all border ${
                            compassionateMode ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Heart className={`w-4 h-4 ${compassionateMode ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-semibold ${compassionateMode ? 'text-emerald-700' : 'text-gray-500'}`}>Supportive</span>
                          </div>
                          <p className="text-xs text-gray-500">Encouraging, empathetic feedback that supports your well-being.</p>
                        </button>
                        <button
                          onClick={() => setCompassionateMode(false)}
                          className={`p-4 rounded-lg text-left transition-all border ${
                            !compassionateMode ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Shield className={`w-4 h-4 ${!compassionateMode ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-semibold ${!compassionateMode ? 'text-emerald-700' : 'text-gray-500'}`}>Direct</span>
                          </div>
                          <p className="text-xs text-gray-500">Factual, no-nonsense alerts when you exceed your goals.</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Reminders</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'mealReminders', label: 'Meal Reminders', desc: 'Get reminders to log your meals' },
                      { id: 'waterReminders', label: 'Water Reminders', desc: 'Stay hydrated throughout the day' },
                      { id: 'exerciseReminders', label: 'Exercise Reminders', desc: 'Reminders to log your workouts' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [item.id]: !(notifications as any)[item.id] })}
                          className={`w-12 h-7 rounded-full transition-all ${(notifications as any)[item.id] ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${(notifications as any)[item.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button onClick={saveSettings} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function SettingsClient(props: SettingsClientProps) {
  return (
    <ThemeProvider>
      <SettingsContent {...props} />
    </ThemeProvider>
  );
}
