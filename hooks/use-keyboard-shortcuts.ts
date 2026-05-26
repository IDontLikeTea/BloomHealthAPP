'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      document.activeElement?.hasAttribute('contenteditable')
    ) {
      return;
    }

    // Check for CMD/Ctrl key
    const isMod = event.metaKey || event.ctrlKey;

    if (isMod) {
      switch (event.key.toLowerCase()) {
        case 'm':
          event.preventDefault();
          router.push('/meals/add');
          break;
        case 'e':
          event.preventDefault();
          router.push('/exercise/add');
          break;
        case 's':
          event.preventDefault();
          router.push('/meals/scan');
          break;
        case 'd':
          event.preventDefault();
          router.push('/dashboard');
          break;
      }
    }
  }, [router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
