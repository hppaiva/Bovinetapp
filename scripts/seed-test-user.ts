import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users } from "../shared/schema";

const email = "teste@bovinet.app";
const password = "teste1234";

async function main() {
  const hash = await bcrypt.hash(password, 10);
  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length > 0) {
    await db.update(users).set({ password: hash }).where(eq(users.email, email));
    console.log("Senha do usuário de teste atualizada.");
  } else {
    await db.insert(users).values({
      name: "Usuário de Teste",
      email,
      phone: "11999999999",
      cpf: "00000000000",
      password: hash,
      city: "São Paulo",
      state: "SP",
      isVerified: true,
    });
    console.log("Usuário de teste criado.");
  }

  console.log("\n==== CREDENCIAIS DE TESTE ====");
  console.log("E-mail:", email);
  console.log("Senha :", password);
  console.log("==============================\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
