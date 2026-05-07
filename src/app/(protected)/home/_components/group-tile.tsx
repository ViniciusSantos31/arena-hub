import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LockIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function GroupTile({
  name,
  code,
  logo,
  isPrivate,
}: {
  name: string;
  code: string;
  logo?: string;
  isPrivate?: boolean;
}) {
  return (
    <Link href={`/group/${code}/overview`} className="group outline-none">
      <Card className="border-border/60 hover:border-primary/50 hover:bg-primary/5 gap-0 py-0 transition-colors">
        <div className="flex items-center gap-3 p-4">
          <div
            className={cn(
              "bg-muted ring-border flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1",
            )}
          >
            {logo ? (
              <Image
                src={logo}
                alt={name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <UsersIcon className="text-muted-foreground h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold">{name}</div>
              {isPrivate ? (
                <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                  <LockIcon className="h-3 w-3" />
                  Privado
                </span>
              ) : null}
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
              <span className="font-mono tracking-wide">{code}</span>
              <span className="bg-border h-1 w-1 rounded-full" />
              <span className="group-hover:text-foreground transition-colors">
                Abrir grupo
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
