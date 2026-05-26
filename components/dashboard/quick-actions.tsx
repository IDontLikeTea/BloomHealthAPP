'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Plus, Dumbbell, MessageSquare } from 'lucide-react';

interface QuickActionsProps {
  onAction: () => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      href: '/meals/scan',
      icon: Camera,
      label: 'Scan Meal',
      description: 'AI photo analysis',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      href: '/meals/add',
      icon: Plus,
      label: 'Log Meal',
      description: 'Manual entry',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      href: '/exercise/add',
      icon: Dumbbell,
      label: 'Exercise',
      description: 'Track activity',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      href: '/companion',
      icon: MessageSquare,
      label: 'AI Chat',
      description: 'Get insights',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={action.href}
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all text-center"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <action.icon className="w-4 h-4" />
              </div>
              <p className="font-medium text-xs text-gray-900">{action.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{action.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
