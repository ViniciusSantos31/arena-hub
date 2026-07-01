"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";

export function GroupOwnerChip({
  owner,
  className,
}: {
  owner: { name: string; email: string; image: string | null } | null;
  className?: string;
}) {
  const fallback = owner?.name ? getAvatarFallback(owner.name) : "—";

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <Avatar className="size-8">
        <AvatarImage src={owner?.image ?? undefined} />
        <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-medium">
          {owner?.name ?? "Sem dono definido"}
        </div>
        {owner?.email ? (
          <div className="text-muted-foreground truncate text-xs">
            {owner.email}
          </div>
        ) : null}
      </div>
    </div>
  );
}

