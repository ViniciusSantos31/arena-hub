import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";

export default async function BackOfficePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session.user.email !== process.env.ADMIN_EMAIL) {
    return unauthorized();
  }

  return redirect("/admin/dashboard");
}
