/**
 * Script de migração: setar private=true em todos os grupos existentes.
 *
 * Executar com:
 *   npx tsx scripts/migrate-groups-to-private.ts
 */
import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { organization } from "../src/db/schema/auth";
import { ne } from "drizzle-orm";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  const result = await db
    .update(organization)
    .set({ private: true })
    .where(ne(organization.private, true))
    .returning({ id: organization.id, name: organization.name });

  console.log(
    `Migração concluída: ${result.length} grupo(s) atualizado(s) para privado.`,
  );

  if (result.length > 0) {
    console.log("Grupos migrados:");
    result.forEach((g) => console.log(`  - [${g.id}] ${g.name}`));
  }
}

main().catch((err) => {
  console.error("Erro na migração:", err);
  process.exit(1);
});
