const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    const project = await prisma.project.findFirst();
    if (!user || !project) {
        console.log('Need a user and project to test');
        return;
    }
    
    console.log('Testing create with:', {
        userId: user.id,
        projectId: project.id
    });

    const f = await prisma.feedback.create({
      data: {
        content: 'Test reply',
        userId: user.id,
        projectId: project.id,
        parentId: null
      }
    });
    console.log('Success:', f.id);
  } catch (err) {
    console.error('FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
