import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { sendOtpEmail } from '../services/email';
import { otpRateLimit, verifyRateLimit } from '../middleware/rateLimit';

const router = Router();

const sendOtpSchema = z.object({
  email: z.string().email(),
  role: z.enum(['MEMBER', 'RECRUITER']).default('MEMBER'),
  companyName: z.string().optional(),
  website: z.string().url().optional().or(z.string().length(0)),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  role: z.enum(['MEMBER', 'RECRUITER']).default('MEMBER'),
  companyName: z.string().optional(),
  website: z.string().url().optional().or(z.string().length(0)),
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /auth/send-otp
router.post('/send-otp', otpRateLimit, async (req: Request, res: Response): Promise<void> => {
  const parsed = sendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, role, companyName } = parsed.data;

  try {
    if (role === 'RECRUITER' && !companyName?.trim()) {
      res.status(400).json({ error: 'Company name is required for recruiter access.' });
      return;
    }

    // For MEMBER: check whitelist
    if (role === 'MEMBER') {
      const whitelisted = await prisma.whitelistEmail.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!whitelisted || !whitelisted.isActive) {
        res.status(403).json({ error: 'This email is not on the whitelist. Access is invite-only for builders.' });
        return;
      }
    }

    // Invalidate old unused OTPs for this email
    await prisma.otpToken.updateMany({
      where: { email: email.toLowerCase(), used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otpToken.create({
      data: {
        email: email.toLowerCase(),
        otp: hashedOtp,
        expiresAt,
      },
    });

    console.log(`\n======================================`);
    console.log(`🔐 OTP for ${email}: ${otp}`);
    console.log(`======================================\n`);

    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.warn(`[WARN] Failed to send email via Resend (likely sandbox restriction): ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`);
      // We continue anyway so the user can use the OTP logged above during development
    }

    res.json({ message: 'OTP sent successfully. Check your email or console.' });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to process OTP request.' });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', verifyRateLimit, async (req: Request, res: Response): Promise<void> => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, otp, role, companyName, website } = parsed.data;

  try {
    if (role === 'RECRUITER' && !companyName?.trim()) {
      res.status(400).json({ error: 'Company name is required for recruiter access.' });
      return;
    }

    const tokenRecord = await prisma.otpToken.findFirst({
      where: {
        email: email.toLowerCase(),
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
      return;
    }

    // Max 5 attempts
    if (tokenRecord.attempts >= 5) {
      await prisma.otpToken.update({ where: { id: tokenRecord.id }, data: { used: true } });
      res.status(400).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
      return;
    }

    const valid = await bcrypt.compare(otp, tokenRecord.otp);
    if (!valid) {
      await prisma.otpToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: { increment: 1 } },
      });
      res.status(400).json({ error: 'Incorrect OTP.' });
      return;
    }

    // Mark OTP as used
    await prisma.otpToken.update({ where: { id: tokenRecord.id }, data: { used: true } });

    // Upsert user
    const whitelistEntry = role === 'MEMBER'
      ? await prisma.whitelistEmail.findUnique({ where: { email: email.toLowerCase() } })
      : null;

    const userRole = role === 'RECRUITER' ? 'RECRUITER' : 'MEMBER';
    
    // Check if admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    const finalRole = adminEmail && email.toLowerCase() === adminEmail.toLowerCase() ? 'ADMIN' : userRole;

    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          role: finalRole as 'MEMBER' | 'RECRUITER' | 'ADMIN',
        },
      });

    }

    if (role === 'RECRUITER' && companyName) {
      await prisma.recruiterAccount.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          companyName: companyName.trim(),
          website: website || null,
        },
        update: {
          companyName: companyName.trim(),
          website: website || null,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Check if profile is complete
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        category: whitelistEntry?.category ?? null,
      },
      isNewUser,
      hasProfile: !!profile?.isComplete,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

export default router;
