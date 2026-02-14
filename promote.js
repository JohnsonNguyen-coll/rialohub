const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  if (!username) {
    console.log('Please provide a username: node promote.js <username>');
    return;
  }

  const user = await prisma.user.update({
    where: { username },
    data: { role: 'admin' }
  });

  console.log(`User ${username} promoted to admin!`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
