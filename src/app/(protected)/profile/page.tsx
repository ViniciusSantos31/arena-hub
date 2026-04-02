import { getLinkedAccounts } from "@/actions/user/get-linked-accounts";
import { getMySubscriptions } from "@/actions/user/get-subscriptions";
import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { SwordsIcon } from "lucide-react";
import { headers } from "next/headers";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";
import { AccountSettingsForm } from "./_components/account-settings-form";
import { PrivateProfileHeader } from "./_components/private-profile-header";
import { SecuritySection } from "./_components/security-section";
import { SubscriptionsSection } from "./_components/subscriptions-section";

const tabTriggerClass =
  "data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:border-b-primary dark:data-[state=active]:border-primary max-w-fit flex-1 rounded-none border-0 border-b-2 border-transparent px-8 text-center";

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "");
}

const mockActivity = [
  { id: "1", group: "Arena FC", date: "28 Mar 2026", confirmed: true },
  { id: "2", group: "Pelada do Bairro", date: "22 Mar 2026", confirmed: true },
  { id: "3", group: "Arena FC", date: "15 Mar 2026", confirmed: false },
  { id: "4", group: "Liga Amigos", date: "10 Mar 2026", confirmed: true },
];

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  const [userProfile, subscriptionsResult, linkedAccountsResult] =
    await Promise.all([
      user?.id
        ? db.query.usersTable.findFirst({
            where: eq(usersTable.id, user.id),
            columns: { bio: true },
          })
        : Promise.resolve(null),
      getMySubscriptions(),
      getLinkedAccounts(),
    ]);

  const subscriptions = (subscriptionsResult?.data ?? []).map((sub) => ({
    id: sub.id,
    groupName: sub.groupName,
    groupCode: sub.groupCode,
    amountCents: sub.amountCents,
    status: sub.status,
    currentPeriodEnd: formatDate(sub.currentPeriodEnd),
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    organizationId: sub.organizationId,
  }));

  const linkedAccounts = (linkedAccountsResult?.data ?? []).map((acc) => ({
    id: acc.id,
    providerId: acc.providerId,
    createdAt: acc.createdAt.toISOString(),
  }));

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
            <TabsTrigger value="settings" className={tabTriggerClass}>
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 px-4 py-5">
            <PrivateProfileHeader
              user={user}
              bio={userProfile?.bio ?? null}
            />

            <Separator />

            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <SwordsIcon className="h-4 w-4 text-muted-foreground" />
                Atividade recente
              </h3>
              <div className="space-y-2">
                {mockActivity.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{match.group}</p>
                      <p className="text-xs text-muted-foreground">
                        {match.date}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
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
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 px-4 py-5">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">Informações pessoais</h2>
              <p className="text-sm text-muted-foreground">
                Atualize suas informações de perfil
              </p>
            </div>

            <AccountSettingsForm
              user={{ ...user, bio: userProfile?.bio }}
            />

            <Separator />

            <SubscriptionsSection subscriptions={subscriptions} />

            <Separator />

            <SecuritySection user={user} linkedAccounts={linkedAccounts} />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
}
