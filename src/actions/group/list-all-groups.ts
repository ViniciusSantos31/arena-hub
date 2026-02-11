"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import { transformGroupMetadata } from "./utils";

export const listAllGroups = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const response = await db.query.organization.findMany({
    with: {
      members: true,
    },
  });

  return response
    .filter((data) =>
      data.members.every((member) => member.userId !== session.user.id),
    )
    .filter((group) => group.members.length < group.maxPlayers)
    .map((group) => ({
      id: group.id,
      name: group.name,
      logo: group.logo,
      code: group.code,
      isPrivate: group.private,
      description: transformGroupMetadata(group.metadata),
      createdAt: group.createdAt,
    }));
});
