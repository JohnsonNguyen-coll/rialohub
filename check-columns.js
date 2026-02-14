const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Try to fetch one feedback and see properties
    const f = await prisma.feedback.findFirst();
    console.log('Feedback record keys:', f ? Object.keys(f) : 'No records found');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
