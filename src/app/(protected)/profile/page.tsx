import { listMyPendingInvites } from "@/actions/invite-links/list-pending-invites";
import { getMyProfile } from "@/actions/user/get-my-profile";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, CircleDotIcon, SendIcon, SwordsIcon } from "lucide-react";
import { headers } from "next/headers";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";
import { AccountSettingsForm } from "./_components/account-settings-form";
import { PendingInvitesList } from "./_components/pending-invites-list";
import { PrivateProfileHeader } from "./_components/private-profile-header";
import { SecuritySection } from "./_components/security-section";

const tabTriggerClass =
  "data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:border-b-primary dark:data-[state=active]:border-primary max-w-fit flex-1 rounded-none border-0 border-b-2 border-transparent px-8 text-center";

export default async function ProfilePage() {
  const [session, profileResult, pendingInvitesResult] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getMyProfile(),
    listMyPendingInvites(),
  ]);

  const user = session?.user;
  const data = profileResult?.data;
  const pendingInvites = pendingInvitesResult?.data ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Perfil" />
      </PageHeader>
      <PageContent className="p-0">
        <Tabs defaultValue="profile" className="flex flex-col gap-0">
          <TabsList className="bg-background sticky top-0 z-10 min-h-12 w-full justify-start rounded-none border-b p-0">
            <TabsTrigger value="profile" className={tabTriggerClass}>
              Perfil
            </TabsTrigger>
            <TabsTrigger value="invites" className={tabTriggerClass}>
              <span className="flex items-center gap-1.5">
                <SendIcon className="h-3.5 w-3.5" />
                Convites
                {pendingInvites.length > 0 && (
                  <Badge className="h-4 min-w-4 rounded-full px-1 text-[10px]">
                    {pendingInvites.length}
                  </Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className={tabTriggerClass}>
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-5 px-4 py-5">
            <PrivateProfileHeader
              user={user}
              bio={data?.profile.bio}
              location={data?.profile.location}
              lookingForGroup={data?.profile.lookingForGroup}
              stats={data?.stats}
            />

            <Separator />

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <SwordsIcon className="text-muted-foreground h-4 w-4" />
                Atividade recente
              </h3>

              {data?.recentMatches && data.recentMatches.length > 0 ? (
                <div className="space-y-2">
                  {data.recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          match.confirmed ? "bg-green-500/10" : "bg-muted"
                        }`}
                      >
                        {match.confirmed ? (
                          <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <CircleDotIcon className="text-muted-foreground h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {match.group}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {match.date}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          match.confirmed
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {match.confirmed ? "Confirmado" : "Na fila"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm">
                  Nenhuma partida registrada ainda.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invites" className="space-y-4 px-4 py-5">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Convites pendentes</h2>
              <p className="text-muted-foreground text-sm">
                Grupos que te convidaram para participar
              </p>
            </div>
            <PendingInvitesList invites={pendingInvites} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 px-4 py-5">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Informações pessoais</h2>
              <p className="text-muted-foreground text-sm">
                Atualize suas informações de perfil
              </p>
            </div>

            <AccountSettingsForm
              user={{
                ...user,
                bio: data?.profile.bio,
                location: data?.profile.location,
                lookingForGroup: data?.profile.lookingForGroup,
              }}
            />

            <Separator />

            <SecuritySection
              user={user}
              linkedAccounts={data?.linkedAccounts ?? []}
            />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
}
