import { listMembers } from "@/actions/member/list";
import { Card, CardContent } from "@/components/ui/card";
import { Role } from "@/utils/role";
import { ActiveMemberList } from "./_components/active-member-list";

export type Member = {
  id?: string;
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

  // return (
  //   <div className="space-y-6">
  //     <Tabs defaultValue="active" className="flex flex-col gap-4">
  //       <TabsList className="bg-background flex w-full border px-0 **:data-[slot=tabs-trigger]:p-4">
  //         <TabsTrigger value="active" className="flex items-center gap-2">
  //           <Users className="h-4 w-4" />
  //           Membros Ativos
  //           <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs">
  //             {response.data.length}
  //           </span>
  //         </TabsTrigger>
  //         <TabsTrigger value="pending" className="flex items-center gap-2">
  //           <UserPlus className="h-4 w-4" />
  //           Solicitações
  //           <span className="rounded-full bg-yellow-400 px-1.5 py-0.5 text-xs text-yellow-950 dark:bg-yellow-900 dark:text-yellow-100">
  //             {0}
  //           </span>
  //         </TabsTrigger>
  //       </TabsList>

  //       <TabsContent value="active">
  //         <ActiveMemberList members={response.data} />
  //       </TabsContent>

  //       <TabsContent value="pending">
  //         <div className="text-muted-foreground py-8 text-center">
  //           Nenhuma solicitação pendente encontrada
  //         </div>
  //       </TabsContent>
  //     </Tabs>
  //   </div>
  // );
}
