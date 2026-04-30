import { listMyGroups } from "@/actions/group/list-my-groups";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { PiLightning } from "react-icons/pi";
import { GroupTile } from "./_components/group-tile";
import { ShortcutTile } from "./_components/shortcut-tile";

export default async function HomePage() {
  const [session, groupsRes] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    listMyGroups(),
  ]);

  const user = session?.user;
  const groups = (groupsRes?.data ?? []).filter((group) => !!group);

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
            title="Explorar grupos"
            description="Descubra grupos públicos e participe"
            icon="search"
            href="/feed"
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
            <Link
              href="/feed"
              className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-4 hover:underline"
            >
              Ver mais
            </Link>
          </div>

          <div className="grid gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
            {groups.map((group) => (
              <GroupTile
                key={group.id}
                name={group.name ?? "Grupo sem nome"}
                code={group.code}
                logo={group.logo ?? undefined}
                isPrivate={group.private ?? false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
