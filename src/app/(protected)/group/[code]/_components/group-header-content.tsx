import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { GlobeIcon, LockIcon, UsersIcon } from "lucide-react";
import Image from "next/image";

export function GroupHeaderContent({
  name,
  logo,
  description,
  code,
  isPrivate,
  maxPlayers,
  className,
}: {
  name: string;
  logo?: string | null;
  description?: string | null;
  code: string;
  isPrivate: boolean;
  maxPlayers: number;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-start gap-3", className)}>
      <SidebarTrigger />

      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="bg-muted/40 hidden w-11 shrink-0 overflow-hidden rounded-xl border sm:block">
          <AspectRatio ratio={1}>
            {logo ? (
              <Image
                src={logo}
                alt={`Logo do grupo ${name}`}
                width={96}
                height={96}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-foreground truncate text-base font-semibold tracking-tight">
              {name}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                {isPrivate ? (
                  <LockIcon className="h-3.5 w-3.5" />
                ) : (
                  <GlobeIcon className="h-3.5 w-3.5" />
                )}
                {isPrivate ? "Privado" : "Público"}
              </Badge>

              <Badge variant="outline" className="font-mono tracking-wide">
                {code}
              </Badge>

              <Badge variant="outline" className="gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" />
                Até {maxPlayers}
              </Badge>
            </div>
          </div>

          {description ? (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

