"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/utils/avatar";
import { Role } from "@/utils/role";
import { useState } from "react";
import { MemberDetailsDialog } from "./member-details-dialog";

interface MemberCardProps {
  member: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    role?: Role;
    score?: number;
    matches?: number;
  };
}

export const MemberCard = ({ member }: MemberCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        className="bg-card border-border/60 hover:border-primary/30 hover:bg-muted/30 @container flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-200"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={member.image ?? undefined} alt={member.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {getAvatarFallback(member.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-foreground truncate text-sm font-semibold">{member.name}</h3>
            <p className="text-muted-foreground truncate text-xs">{member.email}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">Clique para ver os detalhes</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <div className="text-center">
            <p className="text-foreground text-sm font-semibold">{member.score ?? 0}</p>
            <p className="text-muted-foreground text-xs">Nota</p>
          </div>
          <div className="text-center">
            <p className="text-foreground text-sm font-semibold">{member.matches ?? 0}</p>
            <p className="text-muted-foreground text-xs">Partidas</p>
          </div>
        </div>
      </div>
      <MemberDetailsDialog member={member} open={open} onOpenChange={setOpen} />
    </>
  );
};

export const MemberCardLoading = () => {
  return (
    <div className="bg-card border-border/60 flex animate-pulse items-center gap-3 rounded-xl border px-4 py-3">
      <div className="bg-muted h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="bg-muted h-4 w-32 rounded" />
        <div className="bg-muted h-3 w-48 rounded" />
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1 text-center">
          <div className="bg-muted h-4 w-6 rounded" />
          <div className="bg-muted h-3 w-8 rounded" />
        </div>
        <div className="space-y-1 text-center">
          <div className="bg-muted h-4 w-6 rounded" />
          <div className="bg-muted h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
};
