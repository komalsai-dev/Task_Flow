require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Connection successful! Users found:', users.length);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
