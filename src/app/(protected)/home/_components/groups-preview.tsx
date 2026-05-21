import { listAllGroups } from "@/actions/group/list-all-groups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { ArrowRightIcon, CompassIcon, LockIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

export async function GroupsPreview() {
  const result = await listAllGroups();
  const allGroups = result?.data ?? [];

  const available = allGroups
    .filter((g) => g.userStatus !== "member")
    .slice(0, 3);

  if (available.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-1">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <CompassIcon className="text-primary size-4" />
            Grupos disponíveis
          </h2>
          <p className="text-muted-foreground text-sm">
            Grupos que você ainda pode entrar ou solicitar participação.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="shrink-0 text-xs">
          <Link href="/groups">
            Ver todos
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {available.map((group) => {
          const occupancyPercent = Math.round(
            (group.memberCount / group.maxPlayers) * 100,
          );

          return (
            <Link key={group.id} href="/groups" className="group outline-none">
              <Card className="border-border/60 group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="size-10 shrink-0 rounded-xl">
                    {group.logo && (
                      <AvatarImage
                        src={group.logo}
                        alt={group.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                      {getAvatarFallback(group.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {group.name}
                      </span>
                      {group.private ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 px-1.5 py-0 text-[10px]"
                        >
                          <LockIcon className="h-2.5 w-2.5" />
                          Privado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          Público
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <UsersIcon className="h-3 w-3" />
                        {group.memberCount}/{group.maxPlayers}
                      </span>
                      <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${Math.min(occupancyPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <ArrowRightIcon className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-colors" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
