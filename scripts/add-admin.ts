/**
 * Create (or reset the password of) an admin login.
 *
 *   npm run add:admin -- <email> <password> [OWNER|MANAGER|STAFF] ["Full Name"]
 *
 * Examples:
 *   npm run add:admin -- me@dev.com "DevPass!2026" OWNER "Developer"
 *   npm run add:admin -- owner@monor.dz "OwnerPass!2026" OWNER "Store Owner"
 *   npm run add:admin -- staff@monor.dz "StaffPass!2026" STAFF
 *
 * Runs against whatever DATABASE_URL is set (local or your Neon/prod URL).
 * Each admin is a separate row — nobody shares a password. Existing email =
 * password + role + name updated (so this doubles as a password reset).
 */
import { PrismaClient } from "../src/generated/prisma";
import { hash } from "@node-rs/argon2";

const db = new PrismaClient();
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 };
const ROLES = ["OWNER", "MANAGER", "STAFF"] as const;
type Role = (typeof ROLES)[number];

async function main() {
  const [emailArg, password, roleArg, nameArg] = process.argv.slice(2);
  const email = (emailArg ?? "").trim().toLowerCase();
  const role = (roleArg ?? "OWNER").toUpperCase() as Role;
  const name = nameArg ?? email.split("@")[0] ?? "Admin";

  if (!email || !email.includes("@") || !password || password.length < 8) {
    console.error(
      'Usage: npm run add:admin -- <email> <password (min 8)> [OWNER|MANAGER|STAFF] ["Name"]',
    );
    process.exit(1);
  }
  if (!ROLES.includes(role)) {
    console.error(`Role must be one of: ${ROLES.join(", ")}`);
    process.exit(1);
  }

  const passwordHash = await hash(password, ARGON);
  const existing = await db.adminUser.findUnique({ where: { email }, select: { id: true } });

  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash, role, name, disabled: false, failedLogins: 0, lockedUntil: null },
    create: { email, name, passwordHash, role },
  });

  console.log(
    `${existing ? "✓ updated" : "✓ created"} admin  ${email}  (role ${role}, name "${name}")`,
  );
  const total = await db.adminUser.count();
  console.log(`Total admin accounts: ${total}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
