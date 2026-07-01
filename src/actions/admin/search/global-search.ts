"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { ilike, or } from "drizzle-orm";
import { z } from "zod/v4";

export interface AdminGlobalSearchUser {
  id: string;
  name: string;
  email: string;
  href: string;
}

export interface AdminGlobalSearchGroup {
  code: string;
  name: string;
  href: string;
}

export interface AdminGlobalSearchMatch {
  id: string;
  title: string;
  href: string;
}

export interface AdminGlobalSearchResult {
  users: AdminGlobalSearchUser[];
  groups: AdminGlobalSearchGroup[];
  matches: AdminGlobalSearchMatch[];
}

export const adminGlobalSearch = actionClient
  .inputSchema(
    z.object({
      query: z.string().min(2),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const term = `%${parsedInput.query.trim()}%`;

    const [users, groups, matches] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        })
        .from(usersTable)
        .where(or(ilike(usersTable.name, term), ilike(usersTable.email, term)))
        .limit(10),
      db
        .select({
          code: organization.code,
          name: organization.name,
        })
        .from(organization)
        .where(or(ilike(organization.name, term), ilike(organization.code, term)))
        .limit(10),
      db
        .select({
          id: matchesTable.id,
          title: matchesTable.title,
        })
        .from(matchesTable)
        .where(ilike(matchesTable.title, term))
        .limit(10),
    ]);

    const result: AdminGlobalSearchResult = {
      users: users.map((user) => ({
        ...user,
        href: `/admin/users/${user.id}`,
      })),
      groups: groups.map((group) => ({
        ...group,
        href: `/admin/groups/${group.code}`,
      })),
      matches: matches.map((match) => ({
        ...match,
        href: `/admin/matches/${match.id}`,
      })),
    };

    return result;
  });
