import { db } from "@/db";
import { organizationPaymentExemptions } from "@/db/schema/payment-exemption";
import { and, eq, or } from "drizzle-orm";

type MemberRole = "member" | "admin" | "guest" | "owner" | null | undefined;

export async function isMemberExemptFromMatchPayment(
  organizationId: string,
  memberId: string,
  role: MemberRole,
): Promise<boolean> {
  const roleVal = role ?? "member";

  const row = await db.query.organizationPaymentExemptions.findFirst({
    where: and(
      eq(organizationPaymentExemptions.organizationId, organizationId),
      or(
        eq(organizationPaymentExemptions.memberId, memberId),
        eq(organizationPaymentExemptions.role, roleVal),
      ),
    ),
  });

  return !!row;
}
