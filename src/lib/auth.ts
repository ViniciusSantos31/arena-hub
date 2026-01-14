import { db } from "@/db";
import { schema } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

import { ac, admin, guest, member } from "./permissions";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  trustedOrigins: ["http://192.168.0.8:3000", "http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
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
            private: {
              type: "boolean",
              description: "Whether the organization is private or public",
              defaultValue: false,
            },
            maxPlayers: {
              type: "number",
              description:
                "Maximum number of players allowed in the organization",
              defaultValue: 10,
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
  advanced: {
    cookies: {
      session_token: {
        name: "@arena-hub/auth",
      },
    },
  },
});
