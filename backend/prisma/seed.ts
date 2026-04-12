import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with dummy data...');

  // 1. Setup Whitelisted Members
  const memberEmails = [
    'alice@builder.com',
    'bob@hacker.com',
    'charlie@crypto.org',
    'jpgstudying@gmail.com' // Ensure the admin is also on whitelist in case they want a profile
  ];

  for (const email of memberEmails) {
    await prisma.whitelistEmail.upsert({
      where: { email },
      update: {},
      create: {
        email,
        category: email.includes('builder') ? 'SUPER30' : 'SCHOOL',
        isActive: true,
      },
    });
  }

  // 2. Create Users and Profiles
  const profilesData = [
    {
      email: 'alice@builder.com',
      fullName: 'Alice Web3',
      username: 'alice',
      category: 'SUPER30',
      city: 'San Francisco',
      country: 'USA',
      about: 'I build decentralized applications and scale infrastructure. Exploring ZK proofs.',
      techStack: ['Solidity', 'React', 'Node.js', 'Rust'],
      skills: ['Smart Contracts', 'System Design', 'Frontend'],
      activelyLooking: true,
      hasJobOffers: false,
      aiTags: ['Web3', 'DeFi', 'ZK', 'Full-Stack'],
    },
    {
      email: 'bob@hacker.com',
      fullName: 'Bob Frontend',
      username: 'bobby',
      category: 'SCHOOL',
      city: 'London',
      country: 'UK',
      about: 'Passionate about pixel-perfect UI and fast interactions.',
      currentCompany: 'Vercel',
      techStack: ['Next.js', 'Tailwind', 'TypeScript', 'Framer Motion'],
      skills: ['UI/UX', 'Animation', 'Performance'],
      activelyLooking: false,
      hasJobOffers: true,
      aiTags: ['Frontend', 'UI Design', 'React'],
    },
    {
      email: 'charlie@crypto.org',
      fullName: 'Charlie ML',
      username: 'charlieml',
      category: 'SUPER30',
      city: 'Bangalore',
      country: 'India',
      about: 'Training models and building inference APIs. Love playing with new architectures.',
      techStack: ['Python', 'PyTorch', 'FastAPI', 'CUDA'],
      skills: ['Machine Learning', 'Data Science', 'Backend'],
      activelyLooking: true,
      hasJobOffers: false,
      aiTags: ['AI/ML', 'Backend', 'Data'],
    }
  ];

  for (const pData of profilesData) {
    const user = await prisma.user.upsert({
      where: { email: pData.email },
      update: {},
      create: {
        email: pData.email,
        role: 'MEMBER',
      },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: pData.fullName,
        username: pData.username,
        category: pData.category as any,
        city: pData.city,
        country: pData.country,
        about: pData.about,
        currentCompany: pData.currentCompany || null,
        techStack: pData.techStack,
        skills: pData.skills,
        activelyLooking: pData.activelyLooking,
        hasJobOffers: pData.hasJobOffers,
        isComplete: true,
      },
    });

    // Add Tags
    await prisma.aiTag.upsert({
      where: { profileId: profile.id },
      update: {},
      create: {
        profileId: profile.id,
        tags: pData.aiTags,
      },
    });
  }

  // 3. Create a Dummy Recruiter
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter@techcorp.com',
      role: 'RECRUITER',
    },
  });

  await prisma.recruiterAccount.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      companyName: 'TechCorp Inc.',
    },
  });

  // Also make sure admin user exists
  await prisma.user.upsert({
    where: { email: 'jpgstudying@gmail.com' },
    update: {},
    create: {
      email: 'jpgstudying@gmail.com',
      role: 'ADMIN',
    },
  });


  console.log(' Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
