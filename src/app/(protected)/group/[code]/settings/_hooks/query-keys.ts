export const inviteLinksQueryKeys = {
  all: ["invite-links"] as const,
  list: (organizationCode: string) =>
    [...inviteLinksQueryKeys.all, "list", organizationCode] as const,
} as const;
