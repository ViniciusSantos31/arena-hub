"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import type { Status } from "@/utils/status";
import { eq } from "drizzle-orm";
import z from "zod";

export interface AdminMatchPlayer {
  id: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  confirmed: boolean;
  confirmedAt: string | null;
  teamId: number | null;
  paymentStatus: "pending" | "paid" | "refunded" | "exempt";
  joinedAt: string;
}

export interface AdminMatchDetail {
  match: {
    id: string;
    title: string;
    status: Status;
    sport: string;
    category: string;
    date: string;
    time: string;
    location: string;
    description: string | null;
    minPlayers: number;
    maxPlayers: number;
    isPaid: boolean;
    price: number | null;
    scheduledTo: string | null;
    createdAt: string;
    updatedAt: string;
  };
  organization: {
    id: string;
    code: string;
    name: string;
  } | null;
  confirmedPlayers: AdminMatchPlayer[];
  waitingQueue: AdminMatchPlayer[];
}

function mapPlayer(
  player: {
    id: string;
    userId: string | null;
    confirmed: boolean;
    confirmedAt: Date | null;
    teamId: number | null;
    paymentStatus: "pending" | "paid" | "refunded" | "exempt";
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    } | null;
  },
): AdminMatchPlayer {
  return {
    id: player.id,
    userId: player.userId,
    name: player.user?.name ?? null,
    email: player.user?.email ?? null,
    image: player.user?.image ?? null,
    confirmed: player.confirmed,
    confirmedAt: player.confirmedAt?.toISOString() ?? null,
    teamId: player.teamId,
    paymentStatus: player.paymentStatus,
    joinedAt: player.createdAt.toISOString(),
  };
}

export const getAdminMatchDetail = actionClient
  .inputSchema(z.object({ matchId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const match = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.id, parsedInput.matchId),
      columns: {
        id: true,
        title: true,
        status: true,
        sport: true,
        category: true,
        date: true,
        time: true,
        location: true,
        description: true,
        minPlayers: true,
        maxPlayers: true,
        isPaid: true,
        price: true,
        scheduledTo: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        organization: {
          columns: { id: true, code: true, name: true },
        },
        players: {
          columns: {
            id: true,
            userId: true,
            confirmed: true,
            confirmedAt: true,
            teamId: true,
            paymentStatus: true,
            waitingQueue: true,
            bannedFromMatch: true,
            createdAt: true,
          },
          with: {
            user: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!match) {
      return null;
    }

    const activePlayers = match.players.filter((player) => !player.bannedFromMatch);

    const confirmedPlayers = activePlayers
      .filter((player) => !player.waitingQueue)
      .map(mapPlayer)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

    const waitingQueue = activePlayers
      .filter((player) => player.waitingQueue)
      .map(mapPlayer)
      .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

    const data: AdminMatchDetail = {
      match: {
        id: match.id,
        title: match.title,
        status: match.status,
        sport: match.sport,
        category: match.category,
        date: match.date.toISOString(),
        time: match.time,
        location: match.location,
        description: match.description ?? null,
        minPlayers: match.minPlayers,
        maxPlayers: match.maxPlayers,
        isPaid: match.isPaid,
        price: match.price,
        scheduledTo: match.scheduledTo?.toISOString() ?? null,
        createdAt: match.createdAt.toISOString(),
        updatedAt: match.updatedAt.toISOString(),
      },
      organization: match.organization
        ? {
            id: match.organization.id,
            code: match.organization.code,
            name: match.organization.name,
          }
        : null,
      confirmedPlayers,
      waitingQueue,
    };

    return data;
  });
