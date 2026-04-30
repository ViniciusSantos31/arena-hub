"use client";

import type { AdminGroupListItem } from "@/actions/admin/groups/list";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { GroupAdminCard } from "./group-admin-card";

export const GroupsCardsGrid = ({
  groups,
  className,
}: {
  groups: AdminGroupListItem[];
  className?: string;
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      const hay = `${g.name} ${g.code}`.toLowerCase();
      return hay.includes(q);
    });
  }, [groups, query]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou código…"
            className="pl-9"
          />
        </div>
        <div className="text-muted-foreground text-xs">
          {filtered.length} de {groups.length} grupo(s)
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="text-sm font-medium">Nenhum grupo encontrado</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Tente buscar por outro nome ou código.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group) => (
            <GroupAdminCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};
