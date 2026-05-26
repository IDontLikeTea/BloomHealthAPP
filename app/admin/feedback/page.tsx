import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { FeedbackList } from '@/components/admin/feedback-list';

const ADMIN_EMAIL = 'chenclaire521@gmail.com';

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  // Only allow admin access
  if (session.user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return <FeedbackList feedbacks={feedbacks} />;
}
