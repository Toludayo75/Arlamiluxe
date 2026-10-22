import "dotenv/config";
import { db, pool } from "./db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { z } from "zod";

const scryptAsync = promisify(scrypt);
const adminCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdmin() {
  try {
    const validation = adminCredentialsSchema.safeParse({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    if (!validation.success) {
      console.error(
        "Set a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before running seed-admin.",
      );
      process.exitCode = 1;
      return;
    }

    const { email: adminEmail, password: adminPassword } = validation.data;
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: [HIDDEN]");
  } catch {
    console.error("Admin seeding failed. Check the database connection and try again.");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();
