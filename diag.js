const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.feedback.findMany();
  console.log('Total feedbacks:', all.length);
  console.log(JSON.stringify(all, null, 2));
}

main().finally(() => prisma.$disconnect());
