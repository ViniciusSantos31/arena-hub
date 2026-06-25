import "dotenv/config";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { usersTable } from "@/db/schema/user";
import { and, eq, exists, lt, sql } from "drizzle-orm";

/**
 * Marca como early adopters os usuários que eram owner de ≥1 grupo
 * criado antes de PLAN_LAUNCH_DATE. Idempotente.
 */
async function grantEarlyAdopters() {
  const launchDateRaw = process.env.PLAN_LAUNCH_DATE;
  if (!launchDateRaw) {
    throw new Error("PLAN_LAUNCH_DATE não está configurada");
  }

  const launchDate = new Date(launchDateRaw);
  if (Number.isNaN(launchDate.getTime())) {
    throw new Error(`PLAN_LAUNCH_DATE inválida: ${launchDateRaw}`);
  }

  const result = await db
    .update(usersTable)
    .set({
      isEarlyAdopter: true,
      earlyAdopterGrantedAt: sql`COALESCE(${usersTable.earlyAdopterGrantedAt}, NOW())`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(usersTable.isEarlyAdopter, false),
        exists(
          db
            .select({ one: sql`1` })
            .from(member)
            .innerJoin(organization, eq(member.organizationId, organization.id))
            .where(
              and(
                eq(member.userId, usersTable.id),
                eq(member.role, "owner"),
                lt(organization.createdAt, launchDate),
              ),
            ),
        ),
      ),
    )
    .returning({ id: usersTable.id });

  console.log(
    `Early adopters concedidos: ${result.length} usuário(s) marcado(s).`,
  );
  console.log(
    `Critério: owner de grupo criado antes de ${launchDate.toISOString()}`,
  );
}

grantEarlyAdopters().catch((err) => {
  console.error(err);
  process.exit(1);
});
