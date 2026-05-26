'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Sparkles, X } from 'lucide-react';
import { Confetti } from './confetti';
import { useTheme } from '@/lib/theme-context';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'goal' | 'streak' | 'milestone';
}

export function CelebrationModal({ isOpen, onClose, title, message, type = 'goal' }: CelebrationModalProps) {
  const { colors } = useTheme();

  const icons = {
    goal: Sparkles,
    streak: Heart,
    milestone: Star,
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Confetti trigger={isOpen} />
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Icon */}
              <motion.div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Content */}
              <motion.h2
                className="text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {title}
              </motion.h2>
              <motion.p
                className="text-gray-500 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {message}
              </motion.p>

              {/* Button */}
              <motion.button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl font-medium text-white"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Keep Going! 💪
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
