import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();
async function main() {
  try {
    const otpRec = await prisma.otpToken.findFirst({
      where: { email: 'rohanagouri@gmail.com' },
      orderBy: { createdAt: 'desc' }
    });
    fs.writeFileSync('otp-out.txt', JSON.stringify(otpRec));
  } catch(e) {
    fs.writeFileSync('otp-out.txt', 'ERROR: ' + String(e));
  }
}
main().finally(() => prisma.$disconnect());
