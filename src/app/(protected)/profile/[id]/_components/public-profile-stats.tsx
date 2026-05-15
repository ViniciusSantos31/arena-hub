import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel, Role } from "@/utils/role";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  SwordsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

interface MockGroup {
  id: string;
  name: string;
  role: Role | null;
  code: string;
  image: string | null;
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
      <div className="grid grid-cols-2 gap-2.5">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-muted/40 rounded-xl p-3.5">
            <div className="bg-primary/10 mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg">
              <Icon className="text-primary h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">{label}</div>
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
                href={`/group/${group.code}/overview`}
                className="hover:bg-muted/50 flex items-center gap-3 rounded-xl border p-3 transition-colors"
              >
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                  {group.image && <AvatarImage src={group.image} />}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{group.name}</p>
                </div>
                {group.role && (
                  <Badge variant="secondary" className="text-xs">
                    {getRoleLabel(group.role)}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentMatches.length > 0 && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SwordsIcon className="text-muted-foreground h-4 w-4" />
              <h3 className="text-sm font-medium">Últimas partidas</h3>
            </div>
            <div className="space-y-2">
              {recentMatches.map((match) => (
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
          </div>
        </>
      )}
    </div>
  );
}
