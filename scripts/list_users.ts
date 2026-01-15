import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      phone: true,
      role: true,
      fullName: true,
      password: true // I will print this but warn it's a hash
    }
  });

  if (users.length === 0) {
    console.log('No users found in the database.');
  } else {
    console.log('Found ' + users.length + ' users:');
    users.forEach(u => {
      console.log(`Role: ${u.role}, Name: ${u.fullName}, Email: ${u.email}, Phone: ${u.phone}`);
      console.log(`Password Hash: ${u.password.substring(0, 20)}...`); // Truncate hash for brevity
      console.log('---');
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
