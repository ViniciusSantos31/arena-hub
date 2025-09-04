import { db } from "@/db";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

import { ac, admin, guest, member } from "./permissions";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    organization({
      ac,
      roles: { admin, member, guest },
      schema: {
        organization: {
          additionalFields: {
            code: {
              type: "string",
              description: "The organization's unique code",
            },
          },
        },
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
  emailAndPassword: {
    enabled: true,
  },
  session: {
    modelName: "sessionsTable",
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
    },
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  user: {
    modelName: "usersTable",
  },
});
