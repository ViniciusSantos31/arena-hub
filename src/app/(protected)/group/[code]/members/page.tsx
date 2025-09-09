import { listMembers } from "@/actions/member/list";
import { DataTable } from "./_components/data-table";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const response = await listMembers({
    organizationCode: code,
  });

  if ((response.data && response.data.length === 0) || !response.data) {
    return null;
  }

  const members = response.data;

  return <DataTable data={members} />;
}
