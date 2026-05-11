"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SearchIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { PlayerCard } from "./player-card";

interface Player {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  location?: string | null;
  matchesCount: number;
  groupsCount: number;
  commonGroupsCount: number;
}

export function DiscoverClient({ players }: { players: Player[] }) {
  const [search, setSearch] = useState("");
  const [onlyCommon, setOnlyCommon] = useState(false);

  const filtered = players.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase().trim());
    const matchesCommon = onlyCommon ? p.commonGroupsCount > 0 : true;
    return matchesSearch && matchesCommon;
  });

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

        <div className="flex h-10 items-center gap-2 rounded-2xl border p-2 sm:shrink-0">
          <Switch
            id="only-common"
            checked={onlyCommon}
            onCheckedChange={setOnlyCommon}
          />
          <Label
            htmlFor="only-common"
            className="cursor-pointer text-xs select-none"
          >
            Só quem já joga comigo
          </Label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {onlyCommon ? (
                <UsersIcon className="text-primary h-5 w-5" />
              ) : (
                <SearchIcon className="text-primary h-5 w-5" />
              )}
            </EmptyMedia>
            <EmptyTitle>Nenhum jogador encontrado</EmptyTitle>
            <EmptyDescription>
              {onlyCommon
                ? "Nenhum jogador dos seus grupos está na vitrine no momento."
                : "Tente buscar por outro nome ou ajuste os filtros."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 @md:grid-cols-2 @2xl:grid-cols-3">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
