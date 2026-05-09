"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/utils/avatar";
import { Role } from "@/utils/role";
import { ShieldIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { MemberDetailsDialog } from "./member-details-dialog";
import { MemberRoleBadge } from "./member-role-badge";

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
        aria-label={`Ver detalhes de ${member.name}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        className="bg-card border-border/60 hover:border-primary/20 hover:bg-accent/40 group flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 transition-all duration-150"
      >
        <Avatar className="h-10 w-10 shrink-0 transition-transform duration-150 group-hover:scale-105">
          <AvatarImage src={member.image ?? undefined} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {getAvatarFallback(member.name ?? "")}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="text-foreground truncate text-sm leading-snug font-semibold">
            {member.name}
          </h3>
          <span className="text-muted-foreground w-6 shrink-0 text-xs font-medium tabular-nums">
            {member.email}
          </span>
          <div className="mt-0.5">
            <MemberRoleBadge
              memberRole={member.role as Role}
              memberId={member.id ?? ""}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1 text-amber-500">
              <StarIcon className="h-3.5 w-3.5" />
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {member.score ?? 0}
              </span>
            </div>
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              Nota
            </span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <ShieldIcon className="text-primary/60 h-3.5 w-3.5" />
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {member.matches ?? 0}
              </span>
            </div>
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              Partidas
            </span>
          </div>
        </div>
      </div>
      <MemberDetailsDialog member={member} open={open} onOpenChange={setOpen} />
    </>
  );
};

export const MemberCardLoading = () => {
  return (
    <div className="bg-card border-border/60 flex animate-pulse items-center gap-4 rounded-xl border px-4 py-3">
      <div className="bg-muted h-4 w-6 shrink-0 rounded" />
      <div className="bg-muted h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="bg-muted h-4 w-28 rounded" />
        <div className="bg-muted h-4 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted h-4 w-8 rounded" />
          <div className="bg-muted h-2.5 w-6 rounded" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="bg-muted h-4 w-8 rounded" />
          <div className="bg-muted h-2.5 w-10 rounded" />
        </div>
      </div>
    </div>
  );
};
