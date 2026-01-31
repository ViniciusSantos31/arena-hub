import { listMembers } from "@/actions/member/list";
import { Role } from "@/utils/role";
import { notFound } from "next/navigation";
import { ActiveMemberList } from "./_components/active-member-list";
import { ViewRequestsButton } from "./_components/view-requests-button";

export type Member = {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  image?: string | null;
  role?: Role;
  score?: number;
  gamesPlayed?: number;
};

export default async function MembersPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const response = await listMembers({
    organizationCode: code,
  });

  if (!response.data) {
    return notFound();
  }

  return (
    <div className="flex flex-col justify-end gap-4">
      <ViewRequestsButton />
      <ActiveMemberList members={response.data} />
    </div>
  );
}
