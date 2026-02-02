import { listMembers } from "@/actions/member/list";
import { Role } from "@/utils/role";
import { ActiveMemberList } from "../../_components/active-member-list";
import { MemberEmptyList } from "../../_components/member-empty-list";

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
    return <MemberEmptyList />;
  }

  return (
    <div className="flex flex-col justify-end gap-4 pt-4">
      <ActiveMemberList members={response.data} />
    </div>
  );
}
