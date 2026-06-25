"use server";

import {
  encryptInviteToken,
  generateInviteToken,
  hashInviteToken,
} from "@/actions/invite-links/_utils";
import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { directInvitesTable } from "@/db/schema/direct-invite";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { requestsTable } from "@/db/schema/request";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { PlanLimitError } from "@/lib/user-plan/plan-limit-error";
import { getEffectiveMemberCapForOrganization } from "@/lib/user-plan/assertions";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod/v4";

export const reviewJoinRequest = actionClient
  .inputSchema(
    z.object({
      requestId: z.string().min(1),
      action: z.enum(["approve", "reject"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { requestId, action } = parsedInput;

    const request = await db.query.requestsTable.findFirst({
      where: and(
        eq(requestsTable.id, requestId),
        eq(requestsTable.status, "pending"),
      ),
      columns: {
        id: true,
        userId: true,
        organizationId: true,
        status: true,
      },
    });

    if (!request) throw new Error("Solicitação não encontrada ou já processada");

    const myMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, request.organizationId),
        eq(member.userId, session.user.id),
      ),
    });

    if (!myMembership || !can(myMembership, ["membership:approve"])) {
      throw new Error("Sem permissão para revisar solicitações");
    }

    if (action === "reject") {
      await db
        .update(requestsTable)
        .set({ status: "rejected", reviewedBy: session.user.id, updatedAt: new Date().toISOString() })
        .where(eq(requestsTable.id, requestId));

      revalidatePath("/group/[code]/members", "page");
      return { success: true, action: "rejected" };
    }

    // Approve: create invite link + direct invite
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, request.organizationId),
      columns: { id: true, name: true, code: true },
    });

    if (!org) throw new Error("Grupo não encontrado");

    const membersCount = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(member)
      .where(eq(member.organizationId, request.organizationId))
      .then((rows) => rows[0]?.count ?? 0);

    const effectiveCap = await getEffectiveMemberCapForOrganization(
      request.organizationId,
    );

    if (effectiveCap !== null && membersCount >= effectiveCap) {
      throw new PlanLimitError(
        "MEMBER_LIMIT",
        "Este grupo atingiu o limite de membros do plano do organizador.",
        { currentMemberCount: membersCount, cap: effectiveCap },
      );
    }

    const token = generateInviteToken();
    const tokenHash = hashInviteToken(token);
    const encrypted = encryptInviteToken(token);

    const [inviteLink] = await db
      .insert(organizationInviteLink)
      .values({
        organizationId: org.id,
        label: `Solicitação aprovada`,
        tokenHash,
        ...encrypted,
        defaultRole: "guest",
        maxUses: 1,
        createdBy: session.user.id,
      })
      .returning({ id: organizationInviteLink.id });

    await db.insert(directInvitesTable).values({
      inviteLinkId: inviteLink.id,
      organizationId: org.id,
      targetUserId: request.userId,
      sentByUserId: session.user.id,
    });

    await db
      .update(requestsTable)
      .set({ status: "approved", reviewedBy: session.user.id, updatedAt: new Date().toISOString() })
      .where(eq(requestsTable.id, requestId));

    revalidatePath("/group/[code]/members", "page");
    return { success: true, action: "approved" };
  });
