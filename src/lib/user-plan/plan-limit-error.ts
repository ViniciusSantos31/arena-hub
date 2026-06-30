import type { PlanErrorCode } from "./types";

export class PlanLimitError extends Error {
  constructor(
    public readonly code: PlanErrorCode,
    message: string,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PlanLimitError";
  }
}

export function isPlanLimitError(err: unknown): err is PlanLimitError {
  return err instanceof PlanLimitError;
}
