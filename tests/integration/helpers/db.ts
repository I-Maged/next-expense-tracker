import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Dedicated test client — never import the app singleton (@/lib/prisma)
// in integration tests; it is documented for unit mocks only.
let client: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[integration] DATABASE_URL is not set. Did tests/integration/setup.ts run?",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  client = new PrismaClient({ adapter });
  return client;
}

// FK-safe truncate in dependency order (children first).
export async function truncateAll(): Promise<void> {
  const prisma = getTestPrisma();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
}

// Domain-only truncate — keeps users/sessions/accounts so one signup
// per file survives across tests.
export async function truncateDomain(): Promise<void> {
  const prisma = getTestPrisma();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
}

export async function disconnectTestPrisma(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}
