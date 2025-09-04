import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, guest, member } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: {
        guest,
        admin,
        member,
      },
      schema: {
        member: {
          additionalFields: {
            role: {
              type: "string",
              references: {
                model: "member",
                field: "role",
              },
            },
            score: {
              type: "number",
              description: "The member's score",
              defaultValue: 25,
            },
          },
        },
      },
    }),
  ],
});
