import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import https from 'https';
import prisma from '../lib/prisma';

const router = Router();

function getCaseVariants(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  return Array.from(new Set([
    trimmed,
    trimmed.toLowerCase(),
    trimmed.toUpperCase(),
    trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
  ]));
}

async function getVisiblePublicProfileUserIds(): Promise<string[]> {
  const activeWhitelistEntries = await prisma.whitelistEmail.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  if (activeWhitelistEntries.length === 0) {
    return [];
  }

  const visibleUsers = await prisma.user.findMany({
    where: {
      email: { in: activeWhitelistEntries.map((entry) => entry.email) },
    },
    select: { id: true },
  });

  return visibleUsers.map((user) => user.id);
}

async function hasActiveWhitelistVisibility(email: string): Promise<boolean> {
  const whitelistEntry = await prisma.whitelistEmail.findUnique({
    where: { email },
    select: { isActive: true },
  });

  return Boolean(whitelistEntry?.isActive);
}

// GET /public/users — list all profiles (no auth required)
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      techStack,
      skills,
      location,
      hiring,
      tags,
      category,
      search,
      page = '1',
      limit = '24',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;
    const visibleUserIds = await getVisiblePublicProfileUserIds();

    if (visibleUserIds.length === 0) {
      res.json({ users: [], total: 0, page: pageNum, pages: 0 });
      return;
    }

    // Public Explore visibility follows whitelist activity.
    const where: Record<string, unknown> = {
      isComplete: true,
      userId: { in: visibleUserIds },
    };

    if (category) {
      where['category'] = category;
    }

    if (hiring === 'looking') {
      where['activelyLooking'] = true;
    } else if (hiring === 'offers') {
      where['hasJobOffers'] = true;
    }

    if (location) {
      if (!where['AND']) where['AND'] = [];
      (where['AND'] as any[]).push({
        OR: [
        { city: { contains: location as string, mode: 'insensitive' } },
        { country: { contains: location as string, mode: 'insensitive' } },
        ],
      });
    }

    if (techStack) {
      const parsedStacks = (techStack as string).split(',').map((s: string) => s.trim());
      const conditions = parsedStacks.map(stack => ({
        techStack: {
          hasSome: getCaseVariants(stack),
        },
      }));
      if (!where['AND']) where['AND'] = [];
      (where['AND'] as any[]).push(...conditions);
    }

    if (skills) {
      const skillList = (skills as string).split(',').map((s: string) => s.trim());
      const conditions = skillList.map(skill => ({
        skills: {
          hasSome: getCaseVariants(skill),
        },
      }));
      if (!where['AND']) where['AND'] = [];
      (where['AND'] as any[]).push(...conditions);
    }

    if (search) {
      const searchTerm = (search as string).trim();
      const aiTagRecords = await prisma.aiTag.findMany({
        where: { tags: { hasSome: getCaseVariants(searchTerm) } },
        select: { profileId: true },
      });

      const searchConditions: Record<string, unknown>[] = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { username: { contains: searchTerm, mode: 'insensitive' } },
        { about: { contains: searchTerm, mode: 'insensitive' } },
        { currentCompany: { contains: searchTerm, mode: 'insensitive' } },
      ];

      if (aiTagRecords.length > 0) {
        searchConditions.push({ id: { in: aiTagRecords.map((record) => record.profileId) } });
      }

      if (!where['AND']) where['AND'] = [];
      (where['AND'] as any[]).push({ OR: searchConditions });
    }

    // AI tags filter — filter by ai_tags table
    let profileIdsWithTag: string[] | null = null;
    if (tags) {
      const tagList = (tags as string).split(',').map((t: string) => t.trim());
      const aiTagRecords = await prisma.aiTag.findMany({
        where: { tags: { hasSome: tagList } },
        select: { profileId: true },
      });
      profileIdsWithTag = aiTagRecords.map((r: { profileId: string }) => r.profileId);
      if (profileIdsWithTag.length === 0) {
        res.json({ users: [], total: 0, page: pageNum, pages: 0 });
        return;
      }
      where['id'] = { in: profileIdsWithTag };
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          username: true,
          avatar: true,
          city: true,
          country: true,
          about: true,
          currentCompany: true,
          hasJobOffers: true,
          activelyLooking: true,
          techStack: true,
          skills: true,
          interests: true,
          category: true,
          githubUrl: true,
          twitterUrl: true,
          linkedinUrl: true,
          portfolioUrl: true,
          resumeUrl: true,
          phone: true,
          phonePublic: true,
          aiTags: { select: { tags: true } },
          createdAt: true,
        } as any,
      }),
      prisma.profile.count({ where }),
    ]);

    const sanitized = profiles.map((p: any) => ({
      ...p,
      about: p.about ? p.about.substring(0, 200) + (p.about.length > 200 ? '…' : '') : null,
      phone: p.phonePublic ? p.phone : null,
    }));

    res.json({
      users: sanitized,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('public/users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// GET /public/users/:username — single profile
router.get('/users/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { username: (req.params.username as string).toLowerCase() },
      include: {
        aiTags: true,
        user: {
          select: { email: true },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    const isVisiblePublicly = await hasActiveWhitelistVisibility(profile.user.email);
    if (!isVisiblePublicly) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    // Explicitly hide ATS metrics and phone numbers if not the owner
    let requestingUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!) as { id: string };
        requestingUserId = decoded.id;
      } catch (e) {}
    }

    const isOwner = requestingUserId === profile.userId;

    const result = {
      ...profile,
      phone: profile.phonePublic || isOwner ? profile.phone : null,
      atsScore: isOwner ? (profile as any).atsScore : undefined,
      atsFeedback: isOwner ? (profile as any).atsFeedback : undefined,
    };

    res.json({ profile: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// GET /public/users/:username/resume — securely stream resume proxy with enforced filename
router.get('/users/:username/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { username: (req.params.username as string).toLowerCase() },
      select: {
        resumeUrl: true,
        fullName: true,
        username: true,
        resumeFilename: true,
        user: {
          select: { email: true },
        },
      }
    });

    if (!profile || !(profile as any).resumeUrl) {
      res.status(404).send('Resume not found');
      return;
    }

    const isVisiblePublicly = await hasActiveWhitelistVisibility(profile.user.email);
    if (!isVisiblePublicly) {
      res.status(404).send('Resume not found');
      return;
    }

    const p = profile as any;
    const finalName = 'resume.pdf';

    https.get(p.resumeUrl, (proxyRes) => {
      res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Download stream error:', err);
      res.status(500).send('Error proxying file download');
    });

  } catch (err) {
    res.status(500).send('Failed to stream resume');
  }
});

// GET /public/tags — list all unique AI tags (for filter UI)
router.get('/tags', async (_req: Request, res: Response): Promise<void> => {
  try {
    const allTags = await prisma.aiTag.findMany({ select: { tags: true } });
    const tagSet = new Set<string>();
    allTags.forEach((r: { tags: string[] }) => r.tags.forEach((t: string) => tagSet.add(t)));
    res.json({ tags: Array.from(tagSet).sort() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags.' });
  }
});

// GET /public/stats
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const visibleUserIds = await getVisiblePublicProfileUserIds();
    const visibleWhere = visibleUserIds.length === 0 ? { userId: { in: ['__no_visible_profiles__'] } } : { userId: { in: visibleUserIds } };

    const [totalMembers, totalRecruiters, super30Count, schoolCount] = await Promise.all([
      prisma.profile.count({ where: { isComplete: true, ...visibleWhere } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.profile.count({ where: { category: 'SUPER30', isComplete: true, ...visibleWhere } }),
      prisma.profile.count({ where: { category: 'SCHOOL', isComplete: true, ...visibleWhere } }),
    ]);
    res.json({ totalMembers, totalRecruiters, super30Count, schoolCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

export default router;
