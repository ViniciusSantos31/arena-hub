"use server";

import { createMatchSchema } from "@/app/(protected)/group/[code]/matches/_schema/create";
import { db } from "@/db";
import { organization as organizationTable } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

import { notifyNewMatch } from "@/lib/push-notification";
import { getDateWithTime } from "@/utils/date";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const createMatch = actionClient
  .inputSchema(
    createMatchSchema.extend({
      organizationCode: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    // Implement the logic to create a match here.

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { organizationCode: code } = parsedInput;

    if (!code) {
      throw new Error("Organization code is required");
    }

    const group = await getOrgIdByCode({
      code,
    });

    if (!group.data) {
      throw new Error("Group not found");
    }

    const organizationId = group.data;

    const orgRow = await db.query.organization.findFirst({
      where: eq(organizationTable.id, organizationId),
      columns: { stripeAccountId: true },
    });

    if (parsedInput.isPaid) {
      if (!orgRow?.stripeAccountId) {
        throw new Error(
          "Conecte sua conta Stripe nas configurações do grupo para criar partidas pagas.",
        );
      }
      const account = await stripe.accounts.retrieve(orgRow.stripeAccountId);
      if (!account.charges_enabled) {
        throw new Error(
          "Complete o cadastro no Stripe nas configurações do grupo antes de criar partidas pagas.",
        );
      }
    }

    const {
      organizationCode: _code,
      priceReais,
      isPaid,
      ...matchPayload
    } = parsedInput;

    const priceCents =
      isPaid && priceReais != null && !Number.isNaN(priceReais)
        ? Math.round(priceReais * 100)
        : null;

    const dateTime = getDateWithTime(matchPayload.date, matchPayload.time);
    const dateTimeUTC = dayjs(dateTime).utc().toDate();

    // Here you would typically interact with your database to create the match.
    // For demonstration purposes, we'll just return a mock match object.
    const match = await db
      .insert(matchesTable)
      .values({
        ...matchPayload,
        date: dateTimeUTC,
        time: dayjs(dateTimeUTC).format("HH:mm"),
        organizationId,
        isPaid,
        price: isPaid ? priceCents : null,
      })
      .onConflictDoNothing()
      .returning()
      .then((res) => res[0]);

    // Notificar os usuários do grupo sobre a nova partida.
    if (!match) return;

    // Busca todos os membros do grupo para notificar
    const members = await db.query.member.findMany({
      where: (m, { eq }) => eq(m.organizationId, organizationId),
    });

    // Busca o nome do grupo
    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.id, organizationId),
    });

    if (!organization) return;

    const memberIds = members
      .map((m) => m.userId)
      .filter((id): id is string => !!id);

    const matchDate = dayjs(match.date).format("DD/MM [às] HH[h]mm");

    // Notifica todos os membros sobre a nova partida
    await notifyNewMatch({
      groupName: organization.name,
      groupImageUrl: organization.logo ?? "",
      matchDate,
      groupCode: organization.code,
      matchId: match.id,
      memberIds,
    }).catch(console.error);
  });
