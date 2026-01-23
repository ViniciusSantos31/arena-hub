import { listMembers } from "@/actions/member/list";
import { Card, CardContent } from "@/components/ui/card";
import { Role } from "@/utils/role";
import { ActiveMemberList } from "./_components/active-member-list";

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
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-muted-foreground text-center">
              Nenhum membro encontrado
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ActiveMemberList members={response.data} />;
}
