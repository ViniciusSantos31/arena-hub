"use server";

import { db } from "@/db";
import { member, roleEnum } from "@/db/schema/member";
import { organizationPaymentExemptions } from "@/db/schema/payment-exemption";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import type { Role } from "@/utils/role";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getUserMembership } from "./membership";

const roleSchema = z.enum(roleEnum.enumValues);

async function requireSettingsAccess(organizationCode: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const membershipResult = await getUserMembership({
    organizationCode,
  });
  const membership = membershipResult?.data;

  if (!membership || !can(membership, ["group:settings"])) {
    throw new Error(
      "Você não tem permissão para alterar isenções de pagamento.",
    );
  }

  return membership;
}

export type PaymentExemptionListItem = {
  id: string;
  kind: "member" | "role";
  memberId: string | null;
  memberName: string | null;
  memberEmail: string | null;
  role: Role | null;
};

export const listPaymentExemptions = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const membership = await requireSettingsAccess(
      parsedInput.organizationCode,
    );

    const rows = await db.query.organizationPaymentExemptions.findMany({
      where: eq(
        organizationPaymentExemptions.organizationId,
        membership.organizationId,
      ),
      with: {
        member: {
          columns: { id: true },
          with: {
            user: {
              columns: { name: true, email: true },
            },
          },
        },
      },
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });

    const items: PaymentExemptionListItem[] = rows.map((row) => {
      if (row.memberId && row.member) {
        return {
          id: row.id,
          kind: "member" as const,
          memberId: row.memberId,
          memberName: row.member.user?.name ?? null,
          memberEmail: row.member.user?.email ?? null,
          role: null,
        };
      }
      return {
        id: row.id,
        kind: "role" as const,
        memberId: null,
        memberName: null,
        memberEmail: null,
        role: (row.role ?? "member") as Role,
      };
    });

    return items;
  });

export const syncPaymentExemptions = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
      memberIds: z.array(z.string()),
      roles: z.array(roleSchema),
    }),
  )
  .action(async ({ parsedInput }) => {
    const membership = await requireSettingsAccess(
      parsedInput.organizationCode,
    );
    const orgId = membership.organizationId;

    const uniqueMemberIds = [...new Set(parsedInput.memberIds)];
    const uniqueRoles = [...new Set(parsedInput.roles)];

    if (uniqueMemberIds.length > 0) {
      const rows = await db
        .select({ id: member.id })
        .from(member)
        .where(
          and(
            eq(member.organizationId, orgId),
            inArray(member.id, uniqueMemberIds),
          ),
        );

      if (rows.length !== uniqueMemberIds.length) {
        throw new Error(
          "Um ou mais membros não pertencem a este grupo. Atualize a lista e tente de novo.",
        );
      }
    }

    await db
      .delete(organizationPaymentExemptions)
      .where(eq(organizationPaymentExemptions.organizationId, orgId));

    if (uniqueRoles.length > 0) {
      await db.insert(organizationPaymentExemptions).values(
        uniqueRoles.map((role) => ({
          organizationId: orgId,
          role,
        })),
      );
    }

    if (uniqueMemberIds.length > 0) {
      await db.insert(organizationPaymentExemptions).values(
        uniqueMemberIds.map((memberId) => ({
          organizationId: orgId,
          memberId,
        })),
      );
    }

    return { ok: true as const };
  });
