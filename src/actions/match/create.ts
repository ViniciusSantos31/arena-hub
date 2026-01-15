import { createMatchSchema } from "@/app/(protected)/group/[code]/matches/_schema/create";
import { actionClient } from "@/lib/next-safe-action";

export const createMatch = actionClient
  .inputSchema(createMatchSchema)
  .action(async ({ parsedInput }) => {
    // Implement the logic to create a match here.
    console.log("Creating match with data:", parsedInput);
  });
