"use client";

import type { GroupUserStatus } from "@/actions/group/list-all-groups";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SearchIcon, UsersRoundIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GroupDiscoveryCard } from "./group-discovery-card";
import { JoinRequestSheet } from "./join-request-sheet";

type Group = {
  id: string;
  name: string;
  logo: string | null;
  code: string;
  private: boolean;
  maxPlayers: number;
  memberCount: number;
  userStatus: GroupUserStatus;
  inviteToken: string | null;
};

type VisibilityFilter = "all" | "public" | "private";

interface GroupsClientProps {
  groups: Group[];
}

export function GroupsClient({ groups }: GroupsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [requestTarget, setRequestTarget] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const filtered = groups.filter((g) => {
    const matchesSearch = g.name
      .toLowerCase()
      .includes(search.toLowerCase().trim());

    const matchesVisibility =
      visibility === "all" ||
      (visibility === "public" && !g.private) ||
      (visibility === "private" && g.private);

    return matchesSearch && matchesVisibility;
  });

  const handleRequestSuccess = () => {
    setRequestTarget(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <ToggleGroup
          type="single"
          value={visibility}
          onValueChange={(v) => {
            if (v) setVisibility(v as VisibilityFilter);
          }}
          className="h-10 shrink-0 rounded-lg border p-1"
        >
          <ToggleGroupItem value="all" className="h-8 rounded-md px-3 text-xs">
            Todos
          </ToggleGroupItem>
          <ToggleGroupItem
            value="public"
            className="h-8 rounded-md px-3 text-xs"
          >
            Públicos
          </ToggleGroupItem>
          <ToggleGroupItem
            value="private"
            className="h-8 rounded-md px-3 text-xs"
          >
            Privados
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <p className="text-muted-foreground text-xs">
        {filtered.length === groups.length
          ? `${groups.length} ${groups.length === 1 ? "grupo encontrado" : "grupos encontrados"}`
          : `${filtered.length} de ${groups.length} grupos`}
      </p>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRoundIcon className="text-primary h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle>Nenhum grupo encontrado</EmptyTitle>
            <EmptyDescription>
              {search.trim()
                ? "Tente buscar por outro nome ou remova os filtros."
                : "Não há grupos disponíveis no momento."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 @md:grid-cols-1 @2xl:grid-cols-3 @3xl:grid-cols-4">
          {filtered.map((group) => (
            <GroupDiscoveryCard
              key={group.id}
              group={group}
              onRequestJoin={(g) => setRequestTarget(g)}
            />
          ))}
        </div>
      )}

      <JoinRequestSheet
        group={requestTarget}
        onClose={() => setRequestTarget(null)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
}
