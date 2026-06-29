import { PlanLimitError } from "@/lib/user-plan/plan-limit-error";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof PlanLimitError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Algo deu errado. Tente novamente.";
  },
});
