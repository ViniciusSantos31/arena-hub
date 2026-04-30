"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";

export interface AdminGroupListItem {
  id: string;
  code: string;
  name: string;
  private: boolean;
  logo: string | null;
  maxPlayers: number;
  createdAt: string;
  memberCount: number;
  owner: { name: string; email: string; image: string | null } | null;
  lastActivityAt: string;
}

function getLatestDate(dates: Array<Date | null | undefined>): Date | null {
  const filtered = dates.filter(Boolean) as Date[];
  if (filtered.length === 0) return null;
  return filtered.reduce((max, cur) => (cur > max ? cur : max), filtered[0]);
}

export const listAdminGroups = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Acesso negado");
  }

  const groups = await db.query.organization.findMany({
    columns: {
      id: true,
      code: true,
      name: true,
      private: true,
      logo: true,
      maxPlayers: true,
      createdAt: true,
    },
    with: {
      members: {
        columns: { role: true, createdAt: true },
        with: {
          user: {
            columns: { name: true, email: true, image: true },
          },
        },
      },
      matches: {
        columns: { createdAt: true, updatedAt: true },
      },
    },
  });

  const items: AdminGroupListItem[] = groups
    .map((group) => {
      const ownerMember =
        group.members.find((m) => m.role === "owner") ??
        group.members.find((m) => m.role === "admin") ??
        null;

      const latestMemberAt = getLatestDate(
        group.members.map((m) => m.createdAt),
      );
      const latestMatchAt = getLatestDate(
        group.matches.map((m) => m.updatedAt ?? m.createdAt),
      );
      const latestActivityAt =
        getLatestDate([latestMemberAt, latestMatchAt, group.createdAt]) ??
        group.createdAt;

      return {
        id: group.id,
        code: group.code,
        name: group.name,
        private: group.private,
        logo: group.logo ?? null,
        maxPlayers: group.maxPlayers,
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
      };
    })
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

  return { groups: items };
});
