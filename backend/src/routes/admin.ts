import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/whitelist', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const emails = await prisma.whitelistEmail.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ emails });
  } catch {
    res.status(500).json({ error: 'Failed to fetch whitelist.' });
  }
});

router.post('/whitelist', async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    email: z.string().email(),
    category: z.enum(['SUPER30', 'SCHOOL']).default('SCHOOL'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const entry = await prisma.whitelistEmail.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      create: { email: parsed.data.email.toLowerCase(), category: parsed.data.category },
      update: { category: parsed.data.category, isActive: true },
    });
    res.json({ entry });
  } catch {
    res.status(500).json({ error: 'Failed to add email.' });
  }
});

router.post('/whitelist/csv', async (req: AuthRequest, res: Response): Promise<void> => {
  const schema = z.object({
    entries: z.array(z.object({
      email: z.string().email(),
      category: z.enum(['SUPER30', 'SCHOOL']).default('SCHOOL'),
    })),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const results = await Promise.allSettled(
      parsed.data.entries.map((entry) =>
        prisma.whitelistEmail.upsert({
          where: { email: entry.email.toLowerCase() },
          create: { email: entry.email.toLowerCase(), category: entry.category },
          update: { category: entry.category, isActive: true },
        })
      )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.json({ message: `Imported ${succeeded} emails. ${failed} failed.`, succeeded, failed });
  } catch {
    res.status(500).json({ error: 'CSV import failed.' });
  }
});

router.delete('/whitelist/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await prisma.whitelistEmail.findUnique({
      where: { id: req.params.id as string },
    });

    if (!entry) {
      res.status(404).json({ error: 'Entry not found.' });
      return;
    }

    const matchingUser = await prisma.user.findUnique({
      where: { email: entry.email },
      include: {
        profile: {
          select: {
            fullName: true,
            username: true,
          },
        },
      },
    });

    const deletedMember = await prisma.$transaction(async (tx) => {
      const log = await tx.deletedMemberLog.create({
        data: {
          kind: 'WHITELIST',
          deletedEmail: entry.email,
          deletedName: matchingUser?.profile?.fullName ?? null,
          deletedUsername: matchingUser?.profile?.username ?? null,
          deletedCategory: entry.category,
          deletedByEmail: req.user!.email,
        },
      });

      await tx.whitelistEmail.delete({
        where: { id: entry.id },
      });

      return log;
    });

    res.json({ message: 'Email removed from whitelist.', deletedMember });
  } catch {
    res.status(500).json({ error: 'Failed to delete whitelist entry.' });
  }
});

router.patch('/whitelist/:id/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const entry = await prisma.whitelistEmail.findUnique({ where: { id: req.params.id as string } });
    if (!entry) {
      res.status(404).json({ error: 'Entry not found.' });
      return;
    }
    const updated = await prisma.whitelistEmail.update({
      where: { id: req.params.id as string },
      data: { isActive: !entry.isActive },
    });
    res.json({ entry: updated });
  } catch {
    res.status(500).json({ error: 'Failed to toggle entry.' });
  }
});

router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'MEMBER' },
      include: {
        profile: {
          select: {
            fullName: true,
            username: true,
            avatar: true,
            category: true,
            isComplete: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.get('/recruiters', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiters = await prisma.user.findMany({
      where: { role: 'RECRUITER' },
      include: {
        recruiterAccount: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ recruiters });
  } catch {
    res.status(500).json({ error: 'Failed to fetch recruiters.' });
  }
});

router.get('/deleted-members', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deletedMembers = await prisma.deletedMemberLog.findMany({
      orderBy: { deletedAt: 'desc' },
    });
    res.json({ deletedMembers });
  } catch {
    res.status(500).json({ error: 'Failed to fetch deleted members.' });
  }
});

router.delete('/recruiters/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recruiter = await prisma.user.findFirst({
      where: {
        id: req.params.id as string,
        role: 'RECRUITER',
      },
      include: {
        recruiterAccount: true,
      },
    });

    if (!recruiter) {
      res.status(404).json({ error: 'Recruiter not found.' });
      return;
    }

    const deletedMember = await prisma.$transaction(async (tx) => {
      const log = await tx.deletedMemberLog.create({
        data: {
          kind: 'RECRUITER',
          deletedEmail: recruiter.email,
          deletedName: recruiter.recruiterAccount?.companyName ?? recruiter.email,
          deletedCompanyName: recruiter.recruiterAccount?.companyName ?? null,
          deletedWebsite: recruiter.recruiterAccount?.website ?? null,
          deletedByEmail: req.user!.email,
        },
      });

      await tx.user.delete({
        where: { id: recruiter.id },
      });

      return log;
    });

    res.json({ message: 'Recruiter deleted successfully.', deletedMember });
  } catch {
    res.status(500).json({ error: 'Failed to delete recruiter.' });
  }
});

router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalMembers, whitelistCount, recruiterCount, pendingProfiles] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.whitelistEmail.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.profile.count({ where: { isComplete: false } }),
    ]);
    res.json({ totalMembers, whitelistCount, recruiterCount, pendingProfiles });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

export default router;
