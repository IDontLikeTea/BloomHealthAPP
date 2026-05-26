'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const colors = ['#FFB6C1', '#DDA0DD', '#B19CD9', '#87CEEB', '#98D8AA', '#FFD700', '#FFA07A'];

const ConfettiPiece = ({ delay, x }: { delay: number; x: number }) => {
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;
  const rotation = Math.random() * 360;
  const duration = 2 + Math.random() * 1;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x}%`,
        top: -20,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ opacity: 1, y: 0, rotate: 0 }}
      animate={{
        y: window.innerHeight + 100,
        rotate: rotation + 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    />
  );
};

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (trigger && mounted) {
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [trigger, mounted, onComplete]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} x={piece.x} delay={piece.delay} />
      ))}
    </AnimatePresence>
  );
}
