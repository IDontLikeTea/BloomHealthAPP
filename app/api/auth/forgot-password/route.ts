import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (user) {
      // Invalidate any existing tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email: user.email, used: false },
        data: { used: true },
      });

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email: user.email,
          token,
          expiresAt,
        },
      });

      // Send email
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      const appUrl = process.env.NEXTAUTH_URL || '';
      const appName = appUrl ? (() => { try { return new URL(appUrl).hostname.split('.')[0]; } catch { return 'Bloom'; } })() : 'Bloom';

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #10B981; border-radius: 12px; line-height: 48px; font-size: 22px; font-weight: bold; color: white;">B</div>
            <h2 style="margin: 16px 0 0; color: #111827; font-size: 20px;">Reset your password</h2>
          </div>
          <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset the password for your account. Click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Reset Password</a>
          </div>
          <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5;">
            This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #D1D5DB; font-size: 11px; text-align: center;">Bloom Health Tracker</p>
        </div>
      `;

      try {
        await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deployment_token: process.env.ABACUSAI_API_KEY,
            app_id: process.env.WEB_APP_ID,
            notification_id: process.env.NOTIF_ID_PASSWORD_RESET,
            subject: 'Reset your Bloom password',
            body: htmlBody,
            is_html: true,
            recipient_email: user.email,
            sender_email: `noreply@${(() => { try { return new URL(baseUrl).hostname; } catch { return 'bloomhealth.abacusai.app'; } })()}`,
            sender_alias: 'Bloom Health',
          }),
        });
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
      }
    }

    // Always return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
