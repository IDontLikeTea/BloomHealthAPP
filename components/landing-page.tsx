'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Activity, BarChart3, Camera, MessageSquare, Target, Droplets } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Bloom</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </motion.div>
        </nav>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6">
        <section className="py-20 lg:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-6">
              <Activity className="w-3.5 h-3.5" />
              AI-Powered Health Tracking
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Track your health,<br />
            <span className="text-emerald-600">effortlessly</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Log meals, track nutrition, stay hydrated, and get personalized AI insights — all in one clean, simple app.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary text-sm px-6">
              Start Tracking Free
            </Link>
            <Link href="#features" className="btn-secondary text-sm px-6">
              See Features
            </Link>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 border-t border-gray-100">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Everything you need to stay on track
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: 'AI Meal Scanner', description: 'Snap a photo and let AI estimate calories and macros automatically.', color: 'bg-violet-50 text-violet-600' },
              { icon: BarChart3, title: 'Detailed Analytics', description: 'Track your progress with clear charts and weekly insights.', color: 'bg-blue-50 text-blue-600' },
              { icon: MessageSquare, title: 'AI Assistant', description: 'Get personalized nutrition advice and meal suggestions.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Target, title: 'Goal Tracking', description: 'Set and monitor calorie, macro, and hydration goals.', color: 'bg-amber-50 text-amber-600' },
              { icon: Droplets, title: 'Hydration Tracking', description: 'Stay on top of your water intake with easy logging.', color: 'bg-cyan-50 text-cyan-600' },
              { icon: Activity, title: 'Exercise Logging', description: 'Log workouts and track calories burned over time.', color: 'bg-red-50 text-red-600' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="my-20 text-center bg-gray-900 rounded-2xl p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to take control?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
            Join thousands of people tracking their health with Bloom.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition-all">
            Create Free Account
          </Link>
        </motion.section>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Bloom</span>
          </div>
          <p className="text-xs text-gray-400">Simple, practical health tracking</p>
        </footer>
      </main>
    </div>
  );
}
