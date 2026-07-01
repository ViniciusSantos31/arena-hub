"use client";

import { adminGlobalSearch } from "@/actions/admin/search/global-search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAction } from "next-safe-action/hooks";
import {
  CalendarIcon,
  SearchIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function AdminSearchCommand({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { execute, result, isPending } = useAction(adminGlobalSearch);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timeout = window.setTimeout(() => {
      execute({ query: trimmed });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query, execute]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
    }
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const data = result.data;
  const hasResults =
    (data?.users.length ?? 0) > 0 ||
    (data?.groups.length ?? 0) > 0 ||
    (data?.matches.length ?? 0) > 0;
  const showMinLengthHint = query.trim().length > 0 && query.trim().length < 2;

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca global do admin"
        aria-keyshortcuts="Meta+K Control+K"
        className="border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-ring flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Buscar usuários, grupos ou partidas...</span>
        <kbd className="bg-background pointer-events-none hidden rounded border px-1.5 font-mono text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Busca global do admin"
        description="Busque usuários, grupos e partidas"
        className="sm:max-w-lg"
      >
        <CommandInput
          placeholder="Buscar usuários, grupos ou partidas..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {showMinLengthHint ? (
            <CommandEmpty>Digite ao menos 2 caracteres</CommandEmpty>
          ) : isPending ? (
            <CommandEmpty>Buscando...</CommandEmpty>
          ) : query.trim().length >= 2 && !hasResults ? (
            <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
          ) : query.trim().length < 2 ? (
            <CommandEmpty>Digite para buscar</CommandEmpty>
          ) : null}

          {data && data.users.length > 0 && (
            <CommandGroup heading="Usuários">
              {data.users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`user-${user.id}-${user.name}-${user.email}`}
                  onSelect={() => navigate(user.href)}
                >
                  <UsersIcon className="size-4" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data && data.groups.length > 0 && (
            <>
              {data.users.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Grupos">
                {data.groups.map((group) => (
                  <CommandItem
                    key={group.code}
                    value={`group-${group.code}-${group.name}`}
                    onSelect={() => navigate(group.href)}
                  >
                    <UsersRoundIcon className="size-4" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{group.name}</span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {group.code}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {data && data.matches.length > 0 && (
            <>
              {(data.users.length > 0 || data.groups.length > 0) && (
                <CommandSeparator />
              )}
              <CommandGroup heading="Partidas">
                {data.matches.map((match) => (
                  <CommandItem
                    key={match.id}
                    value={`match-${match.id}-${match.title}`}
                    onSelect={() => navigate(match.href)}
                  >
                    <CalendarIcon className="size-4" />
                    <span className="truncate">{match.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
