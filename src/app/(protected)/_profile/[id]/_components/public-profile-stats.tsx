import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SwordsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

interface MockGroup {
  id: string;
  name: string;
  role: string;
  code: string;
  memberCount: number;
}

interface MockMatch {
  id: string;
  group: string;
  date: string;
  confirmed: boolean;
}

interface ProfileStats {
  matches: number;
  groups: number;
}

interface PublicProfileStatsProps {
  stats: ProfileStats;
  commonGroups: MockGroup[];
  recentMatches: MockMatch[];
}

export function PublicProfileStats({
  stats,
  commonGroups,
  recentMatches,
}: PublicProfileStatsProps) {
  const statCards = [
    { label: "Partidas", value: stats.matches, icon: SwordsIcon },
    { label: "Grupos", value: stats.groups, icon: UsersIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="mx-auto grid w-full max-w-xs grid-cols-2 divide-x overflow-hidden rounded-xl border">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="relative flex flex-col items-center gap-1 overflow-hidden py-3 text-center"
          >
            <Icon className="text-muted absolute top-0 left-4 size-full -translate-x-1/2 opacity-100 dark:opacity-40" />

            <span className="text-lg font-bold">{value}</span>
            <span className="text-muted-foreground text-xs">{label}</span>
          </div>
        ))}
      </div>

      {commonGroups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="text-muted-foreground h-4 w-4" />
            <h3 className="text-sm font-medium">Grupos em comum</h3>
          </div>
          <div className="space-y-2">
            {commonGroups.map((group) => (
              <Link
                key={group.id}
                href={`/group/${group.code}/dashboard`}
                className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
              >
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarFallback className="rounded-lg text-sm font-semibold">
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{group.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {group.memberCount} membros
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {group.role}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SwordsIcon className="text-muted-foreground h-4 w-4" />
          <h3 className="text-sm font-medium">Últimas partidas</h3>
        </div>
        <div className="space-y-2">
          {recentMatches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-sm font-medium">{match.group}</p>
                <p className="text-muted-foreground text-xs">{match.date}</p>
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
    </div>
  );
}
