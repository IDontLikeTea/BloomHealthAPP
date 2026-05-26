import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SettingsClient } from '@/components/settings/settings-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const [profile, aiCompanion, trackerCustomization, notificationSettings] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.aICompanion.findUnique({ where: { userId } }),
    prisma.trackerCustomization.findUnique({ where: { userId } }),
    prisma.notificationSettings.findUnique({ where: { userId } }),
  ]);

  return (
    <SettingsClient
      profile={profile}
      aiCompanion={aiCompanion}
      trackerCustomization={trackerCustomization}
      notificationSettings={notificationSettings}
      userName={session.user.name || ''}
      userEmail={session.user.email || ''}
    />
  );
}
