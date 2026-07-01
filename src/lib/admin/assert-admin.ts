import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import type { AdminSession } from "./types";

export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email === adminEmail;
}

export async function assertAdmin(): Promise<AdminSession> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (!isAdminEmail(session.user.email)) {
    throw new Error("Acesso negado");
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
