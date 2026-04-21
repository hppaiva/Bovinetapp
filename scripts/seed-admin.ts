import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users } from "../shared/schema";

const email = "henriquepaivacontact@icloud.com";
const password = "Sakura22ss*";

async function main() {
  const hash = await bcrypt.hash(password, 10);
  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    await db.update(users).set({ password: hash, isAdmin: true, isVerified: true }).where(eq(users.email, email));
    console.log("Admin atualizado:", email);
  } else {
    await db.insert(users).values({
      name: "Henrique Paiva (Admin)",
      email,
      phone: "00000000000",
      cpf: "11111111111",
      password: hash,
      city: "São Paulo",
      state: "SP",
      isVerified: true,
      isAdmin: true,
    });
    console.log("Admin criado:", email);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
