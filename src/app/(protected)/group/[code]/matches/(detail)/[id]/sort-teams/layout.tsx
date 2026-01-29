import { getUserMembership } from "@/actions/group/membership";
import { matchDetails } from "@/actions/match/list";
import { redirect } from "next/navigation";

export default async function SortTeamsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string; id: string }>;
}) {
  const { code, id } = await params;

  const membership = await getUserMembership({
    organizationCode: code,
  });

  const match = await matchDetails({
    matchId: id,
  });

  if (
    !membership.data ||
    membership.data.role === "guest" ||
    membership.data.role === "member"
  ) {
    redirect(`/group/${code}/matches/${id}`);
  }

  if (!match.data || match.data.status !== "closed_registration") {
    redirect(`/group/${code}/matches/${id}`);
  }

  return <section className="flex flex-1 flex-col">{children}</section>;
}
