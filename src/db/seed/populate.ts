import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";

import { seedTutorialData } from "./tutorial";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  // Seed tutorial data first
  await seedTutorialData();

  // const organizationId = "oPpYbNcUSQGtrCNkcSH0C4ryaUrQLx9s";
  // const matchIds = Array.from(
  //   { length: 10 },
  //   () => "bf8c3b7a-b6eb-4970-84f5-fcdc846df52d",
  // );

  // await seed(db, { user, member, playersTable }).refine((f) => ({
  //   user: {
  //     count: 10,
  //     columns: {
  //       name: f.firstName(),
  //       email: f.email(),
  //     },
  //   },
  //   member: {
  //     count: 10,
  //     columns: {
  //       id: f.uuid(),
  //       organizationId: f.valuesFromArray({
  //         values: Array(10).fill(organizationId),
  //       }),
  //       score: f.int({ minValue: 0, maxValue: 50 }),
  //       role: f.valuesFromArray({
  //         values: Array(10).fill("member"),
  //       }),
  //     },
  //   },
  //   playersTable: {
  //     count: 10,
  //     columns: {
  //       id: f.uuid(),
  //       organizationId: f.valuesFromArray({
  //         values: Array(10).fill(organizationId),
  //       }),
  //       matchId: f.valuesFromArray({
  //         values: matchIds,
  //       }),
  //       score: f.int({ minValue: 0, maxValue: 50 }),
  //       teamId: f.valuesFromArray({
  //         values: Array(10).fill(null),
  //       }),
  //     },
  //   },
  // }));
}

main().catch((error) => {
  console.error("Error populating database:", error);
  process.exit(1);
});
