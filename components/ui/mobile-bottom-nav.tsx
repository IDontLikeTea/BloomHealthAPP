'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/companion', label: 'AI', icon: MessageSquare },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const HIDDEN_PATHS = ['/', '/login', '/signup', '/onboarding'];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  
  if (!session?.user) return null;
  if (HIDDEN_PATHS.includes(pathname ?? '')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[56px] transition-all ${
                isActive
                  ? 'text-emerald-600'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
