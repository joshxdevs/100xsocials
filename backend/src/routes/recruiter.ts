import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { sendIntroductionEmail } from '../services/email';

const router = Router();

// All recruiter routes require auth + RECRUITER role
router.use(requireAuth, requireRole('RECRUITER'));

// POST /recruiter/bookmark
router.post('/bookmark', async (req: AuthRequest, res: Response): Promise<void> => {
  const { profileId } = z.object({ profileId: z.string() }).parse(req.body);
  try {
    const bookmark = await prisma.bookmark.create({
      data: { recruiterId: req.user!.id, profileId },
    });
    res.json({ bookmark });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      res.status(409).json({ error: 'Already bookmarked.' });
      return;
    }
    res.status(500).json({ error: 'Failed to bookmark.' });
  }
});

// DELETE /recruiter/bookmark/:profileId
router.delete('/bookmark/:profileId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.bookmark.delete({
      where: {
        recruiterId_profileId: {
          recruiterId: req.user!.id,
          profileId: req.params.profileId as string,
        },
      },
    });
    res.json({ message: 'Bookmark removed.' });
  } catch {
    res.status(404).json({ error: 'Bookmark not found.' });
  }
});

// GET /recruiter/bookmarks — list saved profiles
router.get('/bookmarks', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { recruiterId: req.user!.id },
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            city: true,
            country: true,
            currentCompany: true,
            activelyLooking: true,
            techStack: true,
            skills: true,
            category: true,
            phone: true,
            phonePublic: true,
            aiTags: { select: { tags: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});

// POST /recruiter/contact/:profileId — send intro email
router.post('/contact/:profileId', async (req: AuthRequest, res: Response): Promise<void> => {
  const { profileId } = req.params;
  const { message, subject } = z.object({
    message: z.string().max(1000).optional(),
    subject: z.string().max(200).optional(),
  }).parse(req.body);

  try {
    const profileId = req.params.profileId as string;
    
    // Get recruiter's company
    const recruiterAccount = await prisma.recruiterAccount.findUnique({
      where: { userId: req.user!.id },
    });

    if (!recruiterAccount) {
      res.status(400).json({ error: 'Recruiter account not found.' });
      return;
    }

    // Get target profile
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    // Get target user email
    const targetUser = await prisma.user.findUnique({
      where: { id: profile.userId },
    });

    if (!targetUser) {
      res.status(404).json({ error: 'Associated user not found.' });
      return;
    }

    await sendIntroductionEmail(
      targetUser.email,
      profile.fullName,
      recruiterAccount.companyName,
      req.user!.email,
      message,
      subject
    );

    res.json({ message: 'Introduction email sent successfully.' });
  } catch (err) {
    console.error('contact error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// GET /recruiter/profile — recruiter's own account info
router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await prisma.recruiterAccount.findUnique({
      where: { userId: req.user!.id },
    });
    const stats = {
      bookmarksCount: await prisma.bookmark.count({ where: { recruiterId: req.user!.id } }),
    };
    res.json({ account, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recruiter profile.' });
  }
});

export default router;
