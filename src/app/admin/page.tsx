import { assertAdmin } from "@/lib/admin/assert-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BackOfficePage() {
  try {
    await assertAdmin();
  } catch {
    redirect("/");
  }

  return redirect("/admin/dashboard");
}
