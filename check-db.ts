
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('Checking _prisma_migrations table...');
  try {
    const migrations = await prisma.$queryRaw`SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" ASC`;
    console.log('Applied Migrations:');
    console.table(migrations);
  } catch (e) {
    console.error('Error fetching migrations:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
