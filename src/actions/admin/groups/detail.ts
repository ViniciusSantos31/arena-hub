"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export interface AdminGroupDetail {
  group: {
    id: string;
    code: string;
    name: string;
    private: boolean;
    logo: string | null;
    maxPlayers: number;
    rules: string | null;
    createdAt: string;
    memberCount: number;
    owner: { name: string; email: string; image: string | null } | null;
    lastActivityAt: string;
  };
  members: Array<{
    id: string;
    role: "member" | "admin" | "guest" | "owner";
    score: number;
    joinedAt: string;
    user: { id: string; name: string; email: string; image: string | null };
  }>;
  matches: Array<{
    id: string;
    title: string;
    status:
      | "scheduled"
      | "open_registration"
      | "closed_registration"
      | "team_sorted"
      | "completed"
      | "cancelled";
    date: string;
    time: string;
    sport: string;
    category: string;
    location: string;
    minPlayers: number;
    maxPlayers: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

function getLatestDate(dates: Array<Date | null | undefined>): Date | null {
  const filtered = dates.filter(Boolean) as Date[];
  if (filtered.length === 0) return null;
  return filtered.reduce((max, cur) => (cur > max ? cur : max), filtered[0]);
}

function rolePriority(role: string | null | undefined) {
  switch (role) {
    case "owner":
      return 0;
    case "admin":
      return 1;
    case "member":
      return 2;
    case "guest":
      return 3;
    default:
      return 99;
  }
}

export const getAdminGroupDetail = actionClient
  .inputSchema(z.object({ code: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
      throw new Error("Acesso negado");
    }

    const group = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.code),
      columns: {
        id: true,
        code: true,
        name: true,
        private: true,
        logo: true,
        maxPlayers: true,
        rules: true,
        createdAt: true,
      },
      with: {
        members: {
          columns: { id: true, role: true, score: true, createdAt: true, userId: true },
          with: {
            user: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        matches: {
          columns: {
            id: true,
            title: true,
            status: true,
            date: true,
            time: true,
            sport: true,
            category: true,
            location: true,
            minPlayers: true,
            maxPlayers: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!group) {
      throw new Error("Grupo não encontrado");
    }

    const ownerMember =
      group.members.find((m) => m.role === "owner") ??
      group.members.find((m) => m.role === "admin") ??
      null;

    const latestMemberAt = getLatestDate(group.members.map((m) => m.createdAt));
    const latestMatchAt = getLatestDate(group.matches.map((m) => m.updatedAt ?? m.createdAt));
    const latestActivityAt =
      getLatestDate([latestMemberAt, latestMatchAt, group.createdAt]) ?? group.createdAt;

    const members = group.members
      .map((m) => ({
        id: m.id,
        role: (m.role ?? "member") as "member" | "admin" | "guest" | "owner",
        score: m.score,
        joinedAt: m.createdAt.toISOString(),
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image ?? null,
        },
      }))
      .sort((a, b) => {
        const prio = rolePriority(a.role) - rolePriority(b.role);
        if (prio !== 0) return prio;
        return b.joinedAt.localeCompare(a.joinedAt);
      });

    const matches = group.matches
      .map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        date: m.date.toISOString(),
        time: m.time,
        sport: m.sport,
        category: m.category,
        location: m.location,
        minPlayers: m.minPlayers,
        maxPlayers: m.maxPlayers,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const data: AdminGroupDetail = {
      group: {
        id: group.id,
        code: group.code,
        name: group.name,
        private: group.private,
        logo: group.logo ?? null,
        maxPlayers: group.maxPlayers,
        rules: group.rules ?? null,
        createdAt: group.createdAt.toISOString(),
        memberCount: group.members.length,
        owner: ownerMember
          ? {
              name: ownerMember.user.name,
              email: ownerMember.user.email,
              image: ownerMember.user.image ?? null,
            }
          : null,
        lastActivityAt: latestActivityAt.toISOString(),
      },
      members,
      matches,
    };

    return data;
  });

