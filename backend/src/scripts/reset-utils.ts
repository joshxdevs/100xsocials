import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../lib/prisma';

export type ResetMode = 'full' | 'fresh';

const ADMIN_EMAIL = 'jpgstudying@gmail.com';
const ADMIN_CATEGORY = 'SCHOOL' as const;
const CONFIRM_FLAG = '--confirm';
const SKIP_CLOUDINARY_FLAG = '--skip-cloudinary';

const CLOUDINARY_TARGETS = [
  { prefix: '100x-socials/avatars', resourceType: 'image' as const },
  { prefix: '100x-socials/resumes', resourceType: 'raw' as const },
];

function isConfirmed() {
  return process.argv.includes(CONFIRM_FLAG) || process.env.RESET_CONFIRM === 'YES_I_UNDERSTAND';
}

function shouldSkipCloudinary() {
  return process.argv.includes(SKIP_CLOUDINARY_FLAG);
}

function printUsage(mode: ResetMode) {
  console.log('');
  console.log(`Reset script is ready, but it will not run without confirmation.`);
  console.log('');
  console.log(`Run one of these when you actually want it:`);
  console.log(`  npm run reset:${mode} -- --confirm`);
  console.log('');
  console.log(`Optional: append ${SKIP_CLOUDINARY_FLAG} if you intentionally want a DB-only reset.`);
  console.log(`  npm run reset:${mode} -- --confirm ${SKIP_CLOUDINARY_FLAG}`);
  console.log('');
}

function ensureCloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary credentials are missing. Refusing incomplete reset. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET or use --skip-cloudinary.'
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

async function deleteCloudinaryFolder(prefix: string, resourceType: 'image' | 'raw') {
  let nextCursor: string | undefined;
  let found = 0;
  let deleted = 0;

  do {
    const response = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    });

    const publicIds = (response.resources ?? []).map((resource: { public_id: string }) => resource.public_id);
    found += publicIds.length;

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds, {
        type: 'upload',
        resource_type: resourceType,
      });
      deleted += publicIds.length;
    }

    nextCursor = response.next_cursor;
  } while (nextCursor);

  try {
    await cloudinary.api.delete_folder(prefix);
  } catch {
    // Folder may already be gone or still contain nested content; asset deletion is the important part.
  }

  return { prefix, resourceType, found, deleted };
}

async function deleteCloudinaryAssets() {
  const results = [];
  for (const target of CLOUDINARY_TARGETS) {
    results.push(await deleteCloudinaryFolder(target.prefix, target.resourceType));
  }
  return results;
}

async function ensureAdmin(tx: Prisma.TransactionClient) {
  const adminUser = await tx.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      role: 'ADMIN',
    },
    update: {
      role: 'ADMIN',
    },
  });

  await tx.whitelistEmail.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      category: ADMIN_CATEGORY,
      isActive: true,
    },
    update: {
      category: ADMIN_CATEGORY,
      isActive: true,
    },
  });

  return adminUser;
}

async function runFullResetTransaction() {
  return prisma.$transaction(async (tx) => {
    await tx.otpToken.deleteMany();
    await tx.bookmark.deleteMany();
    await tx.aiTag.deleteMany();
    await tx.deletedMemberLog.deleteMany();
    await tx.profile.deleteMany();
    await tx.recruiterAccount.deleteMany();
    await tx.user.deleteMany();
    await tx.whitelistEmail.deleteMany();

    const adminUser = await ensureAdmin(tx);

    return {
      keptAdminEmail: adminUser.email,
      preservedWhitelist: false,
    };
  });
}

async function runFreshResetTransaction() {
  return prisma.$transaction(async (tx) => {
    await tx.otpToken.deleteMany();
    await tx.bookmark.deleteMany();
    await tx.aiTag.deleteMany();
    await tx.deletedMemberLog.deleteMany();
    await tx.profile.deleteMany();
    await tx.recruiterAccount.deleteMany();
    await tx.user.deleteMany({
      where: {
        email: { not: ADMIN_EMAIL },
      },
    });

    const adminUser = await ensureAdmin(tx);

    return {
      keptAdminEmail: adminUser.email,
      preservedWhitelist: true,
    };
  });
}

export async function runReset(mode: ResetMode) {
  if (!isConfirmed()) {
    printUsage(mode);
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log(`Starting ${mode === 'full' ? 'full reset' : 'fresh-start reset'}...`);
  console.log(`Admin email preserved: ${ADMIN_EMAIL}`);
  console.log('');

  let cloudinaryResults:
    | Array<{ prefix: string; resourceType: 'image' | 'raw'; found: number; deleted: number }>
    | null = null;

  if (shouldSkipCloudinary()) {
    console.log('Skipping Cloudinary cleanup because --skip-cloudinary was provided.');
  } else {
    ensureCloudinaryConfig();
    cloudinaryResults = await deleteCloudinaryAssets();
  }

  const dbResult = mode === 'full'
    ? await runFullResetTransaction()
    : await runFreshResetTransaction();

  console.log('');
  console.log('Reset complete.');
  console.log('');

  if (cloudinaryResults) {
    console.log('Cloudinary cleanup:');
    cloudinaryResults.forEach((result) => {
      console.log(
        `  - ${result.prefix} (${result.resourceType}): deleted ${result.deleted} of ${result.found} assets`
      );
    });
    console.log('');
  }

  console.log('Database result:');
  console.log(`  - admin email kept: ${dbResult.keptAdminEmail}`);
  console.log(`  - whitelist preserved: ${dbResult.preservedWhitelist ? 'yes' : 'no'}`);
  console.log('');
}

export async function closeResetConnections() {
  await prisma.$disconnect();
}
