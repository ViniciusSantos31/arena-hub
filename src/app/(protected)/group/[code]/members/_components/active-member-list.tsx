"use client";

import { listMembers } from "@/actions/member/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Role, getRoleLabel } from "@/utils/role";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowDownAZIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FilterIcon,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Member } from "../@tabs/active/page";
import { MemberCard } from "./member-card";

type SortBy = "matches" | "score";
type SortDir = "desc" | "asc";

const ROLE_OPTIONS: Role[] = ["owner", "admin", "member", "guest"];

const EmptyMemberList = () => {
  return (
    <Empty className="h-full pb-0 md:pb-0">
      <EmptyHeader>
        <EmptyMedia>
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage
                src="https://github.com/gustavomenezesh.png"
                alt="@gustavomenezesh"
              />
              <AvatarFallback>GM</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/danhenriquex.png"
                alt="@danhenriquex"
              />
              <AvatarFallback>DH</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/viniciussantos31.png"
                alt="@viniciussantos31"
              />
              <AvatarFallback>VS</AvatarFallback>
            </Avatar>
          </div>
        </EmptyMedia>
        <EmptyTitle>Não existem membros ativos com esses filtros</EmptyTitle>
        <EmptyDescription>
          Altere os filtros para encontrar membros ativos.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

export const ActiveMemberList = ({
  members: serverMembers,
}: {
  members: Member[];
}) => {
  const { code } = useParams<{ code: string }>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("matches");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: members } = useQuery({
    queryKey: ["active-members", code],
    enabled: !!code,
    initialData: serverMembers,
    placeholderData: keepPreviousData,
    queryFn: async () =>
      await listMembers({
        organizationCode: code,
      }).then((res) => res.data || []),
  });

  const filteredAndSorted = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    const filtered = members
      .filter((member) => {
        if (selectedRoles.length === 0) return true;
        return !!member.role && selectedRoles.includes(member.role);
      })
      .filter((member) => {
        if (!query) return true;
        return (member.name ?? "").toLowerCase().includes(query);
      });

    const getSortValue = (m: Member) => {
      if (sortBy === "score") return m.score ?? 0;
      return m.matches ?? 0;
    };

    return [...filtered].sort((a, b) => {
      const diff = getSortValue(a) - getSortValue(b);
      if (diff === 0) return 0;
      return sortDir === "asc" ? diff : -diff;
    });
  }, [members, debouncedSearch, selectedRoles, sortBy, sortDir]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedRoles.length > 0 ||
    sortBy !== "matches" ||
    sortDir !== "desc";

  const clearFilters = () => {
    setSearch("");
    setSelectedRoles([]);
    setSortBy("matches");
    setSortDir("desc");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="@container flex flex-col gap-2">
        <div className="flex flex-col gap-2 @md:flex-row @md:items-center">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome"
              autoComplete="off"
              aria-autocomplete="none"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 @md:w-auto">
                  <FilterIcon />
                  <span>
                    Filtros
                    {selectedRoles.length > 0
                      ? ` (${selectedRoles.length})`
                      : ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por cargo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ROLE_OPTIONS.map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={(checked) => {
                      setSelectedRoles((prev) => {
                        if (checked)
                          return Array.from(new Set([...prev, role]));
                        return prev.filter((r) => r !== role);
                      });
                    }}
                  >
                    {getRoleLabel(role)}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start px-2"
                  onClick={() => setSelectedRoles([])}
                  disabled={selectedRoles.length === 0}
                >
                  Limpar filtros
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 @md:w-auto">
                  <ArrowDownAZIcon />
                  <span>Ordenar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                >
                  <DropdownMenuRadioItem value="matches">
                    Partidas
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="score">
                    Nota
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start px-2"
                  onClick={() =>
                    setSortDir((prev) => (prev === "desc" ? "asc" : "desc"))
                  }
                >
                  {sortDir === "desc" ? <ArrowDownIcon /> : <ArrowUpIcon />}
                  {sortDir === "desc" ? "Maior → menor" : "Menor → maior"}
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" asChild className="w-fit">
              <Link href={`/group/${code}/settings#invite-links`}>
                <LinkIcon />
                <span className="hidden @md:block">Convidar</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex h-8 items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            Mostrando {filteredAndSorted.length} de {members.length}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          Nenhum membro ativo encontrado
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 py-8 text-center">
          <EmptyMemberList />
          <Button variant="outline" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredAndSorted.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};
