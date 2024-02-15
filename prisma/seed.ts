import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // const user.ts = await prisma.user.ts.upsert({
  //   where: { email: '...' },
  //   update: {},
  //   create: {}
  // })

  for (const rt of ["business", "friendship", "relationship", "traveling", "communication"]) {
    await prisma.registrationTarget.upsert({
      where: {target: rt},
      update: {},
      create: {target: rt}
    });
  }
  // await prisma.batch(registrationTargets);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
