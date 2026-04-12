import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { upload, uploadToCloudinary, uploadPdfToCloudinary } from '../services/cloudinary';
import { generateProfileTags, generateATSScore } from '../services/gemini';
import multer from 'multer';
const pdfParse = require('pdf-parse');

const router = Router();

function handleUpload(fieldName: 'avatar' | 'resume') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req as any, res as any, (err: any) => {
      if (!err) {
        next();
        return;
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'File is too large. Please upload a file smaller than 10MB.' });
          return;
        }

        res.status(400).json({ error: err.message || 'Upload failed.' });
        return;
      }

      res.status(400).json({ error: err.message || 'Invalid file upload.' });
    });
  };
}

const onboardingSchema = z.object({
  fullName: z.string().min(1).max(120),
  username: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/, 'Username: lowercase letters, numbers, underscores only'),
  avatar: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  phonePublic: z.boolean().default(false),
  age: z.number().int().min(16).max(100).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  about: z.string().max(2000).optional(),
  currentCompany: z.string().optional(),
  hasJobOffers: z.boolean().default(false),
  jobOffersDesc: z.string().optional(),
  jobUrl: z.string().url().optional().or(z.literal('')),
  salaryRange: z.string().optional(),
  jobLocation: z.string().optional(),
  activelyLooking: z.boolean().default(false),
  techStack: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  aiTags: z.array(z.string()).optional(),
});

// POST /user/onboarding — create/update profile
router.post('/onboarding', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { aiTags, ...data } = parsed.data;
  const userId = req.user!.id;

  try {
    const existing = await prisma.profile.findFirst({
      where: { username: data.username, userId: { not: userId } },
    });
    if (existing) {
      res.status(409).json({ error: 'Username already taken.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const whitelistEntry = await prisma.whitelistEmail.findUnique({
      where: { email: user!.email },
    });

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
        category: whitelistEntry?.category ?? 'SCHOOL',
        isComplete: true,
      },
      update: {
        ...data,
        isComplete: true,
      },
    });

    if (aiTags) {
      await prisma.aiTag.upsert({
        where: { profileId: profile.id },
        create: { profileId: profile.id, tags: aiTags },
        update: { tags: aiTags },
      });
    } else if (data.about || data.techStack.length || data.skills.length) {
      generateProfileTags(data.about ?? '', data.techStack, data.skills, data.interests)
        .then(async (tags) => {
          if (tags.length > 0) {
            await prisma.aiTag.upsert({
              where: { profileId: profile.id },
              create: { profileId: profile.id, tags },
              update: { tags },
            });
          }
        }).catch(console.error);
    }

    res.json({ message: 'Profile saved successfully.', profile });
  } catch (err) {
    console.error('onboarding error:', err);
    res.status(500).json({ error: 'Failed to save profile.' });
  }
});

// POST /user/avatar — upload to Cloudinary
router.post('/avatar', requireAuth, handleUpload('avatar'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }

  try {
    const url = await uploadToCloudinary(req.file.buffer);
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
      select: { id: true },
    });
    if (existingProfile) {
      await prisma.profile.update({
        where: { userId: req.user!.id },
        data: { avatar: url },
      });
    }
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar.' });
  }
});

// POST /user/resume — upload to Cloudinary, parse text, get ATS score
router.post('/resume', requireAuth, handleUpload('resume'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }
  
  if (req.file.mimetype !== 'application/pdf') {
    res.status(400).json({ error: 'Only PDF files are supported for resumes.' });
    return;
  }

  try {
    const userId = req.user!.id;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found. Complete onboarding first.' });
      return;
    }

    // 1. Upload to Cloudinary (raw format)
    const url = await uploadPdfToCloudinary(req.file.buffer);

    // 2. Extract Text from PDF Buffer
    let parsedText = '';
    let parseErrorString = 'None';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      parsedText = pdfData.text || '';
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      parseErrorString = parseError.message || String(parseError);
    }

    // 3. Generate ATS Score if parsing succeeded
    let atsData = { score: 0, feedback: '' };
    if (parsedText.length > 50) {
      atsData = await generateATSScore(parsedText, profile.techStack || [], profile.about || '');
    } else {
      atsData.feedback = `Debugging Info - Could not extract enough text from the PDF. Text length extracted: ${parsedText.length}. Parsing Error: ${parseErrorString}. Ensure your PDF has selectable text and is not just a scanned image.`;
    }

    // 4. Save to DB
    const updated = await prisma.profile.update({
      where: { userId },
      data: { 
        resumeUrl: url,
        resumeFilename: req.file.originalname,
        atsScore: atsData.score,
        atsFeedback: atsData.feedback
      },
      include: { aiTags: true }
    });

    res.json({ 
      success: true, 
      profile: updated 
    });
  } catch (err) {
    console.error('Resume processing error:', err);
    res.status(500).json({ error: 'Failed to process resume upload.' });
  }
});


// GET /user/profile — get own profile
router.get('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
      include: { aiTags: true },
    });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /user/profile — update own profile
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = onboardingSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { aiTags, ...data } = parsed.data;
  const userId = req.user!.id;

  try {
    if (data.username) {
      const existing = await prisma.profile.findFirst({
        where: {
          username: data.username,
          userId: { not: userId },
        },
      });

      if (existing) {
        res.status(409).json({ error: 'Username already taken.' });
        return;
      }
    }

    const profile = await prisma.profile.update({
      where: { userId },
      data: { ...data },
    });

    if (aiTags) {
      await prisma.aiTag.upsert({
        where: { profileId: profile.id },
        create: { profileId: profile.id, tags: aiTags },
        update: { tags: aiTags },
      });
    } else if (data.about || data.techStack?.length || data.skills?.length) {
      generateProfileTags(profile.about ?? '', profile.techStack, profile.skills, profile.interests)
        .then(async (tags) => {
          if (tags.length > 0) {
            await prisma.aiTag.upsert({
              where: { profileId: profile.id },
              create: { profileId: profile.id, tags },
              update: { tags },
            });
          }
        }).catch(console.error);
    }

    res.json({ message: 'Profile updated successfully.', profile });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      res.status(409).json({ error: 'Username already taken.' });
      return;
    }
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /user/generate-ai-tags
router.post('/generate-ai-tags', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { about, techStack, skills, interests } = req.body;
    const tags = await generateProfileTags(about || '', techStack || [], skills || [], interests || []);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate AI tags.' });
  }
});

// GET /user/check-username
router.get('/check-username', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const username = (req.query.username as string)?.toLowerCase();
  if (!username) {
    res.status(400).json({ error: 'Username required' });
    return;
  }
  const exists = await prisma.profile.findFirst({ 
    where: { username, userId: { not: req.user!.id } } 
  });
  res.json({ available: !exists });
});

export default router;
