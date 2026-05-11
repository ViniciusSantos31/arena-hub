import { listMyPendingInvites } from "@/actions/invite-links/list-pending-invites";
import { listMyGroups } from "@/actions/group/list-my-groups";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PiLightning } from "react-icons/pi";
import { GroupTile } from "./_components/group-tile";
import { PendingInvitesBanner } from "./_components/pending-invites-banner";
import { ShortcutTile } from "./_components/shortcut-tile";

export default async function HomePage() {
  const [session, groupsRes, pendingInvitesRes] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    listMyGroups(),
    listMyPendingInvites(),
  ]);

  const user = session?.user;
  const groups = (groupsRes?.data ?? []).filter((group) => !!group);
  const pendingInvites = pendingInvitesRes?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Bem-vindo de volta,{" "}
            <span className="text-primary font-black">{user?.name}</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Aqui você pode gerenciar seus grupos, partidas e membros.
          </p>
        </div>
      </section>
      <PendingInvitesBanner invites={pendingInvites} />

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="flex items-center gap-1 text-sm font-medium">
            <PiLightning className="text-primary size-4" />
            Ações rápidas
          </h2>
        </div>

        <div className="grid gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
          <ShortcutTile
            title="Criar grupo"
            description="Monte um novo grupo e convide a galera"
            icon="plus"
            href="/group/create"
            accent="primary"
          />
          <ShortcutTile
            title="Encontre jogadores"
            description="Descubra jogadores procurando grupo para jogar"
            icon="search"
            href="/discover"
            accent="violet"
          />
          <ShortcutTile
            title="Como usar"
            description="Guia rápido para aproveitar todos os recursos"
            icon="graduation"
            href="/learn-more"
            accent="amber"
          />
        </div>
      </section>
      {groups.length !== 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Meus grupos</h2>
              <p className="text-muted-foreground text-sm">
                Acesse rapidamente seus grupos mais usados.
              </p>
            </div>
          </div>

          <div className="grid gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
            {groups.map((group) => (
              <GroupTile
                key={group.id}
                name={group.name ?? "Grupo sem nome"}
                code={group.code}
                logo={group.logo ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
