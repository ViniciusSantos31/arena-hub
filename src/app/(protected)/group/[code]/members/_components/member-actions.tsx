"use client";

import { Badge } from "@/components/ui/badge";
import { useGuard } from "@/hooks/use-guard";
import { cn } from "@/lib/utils";
import { Role } from "@/utils/role";
import { Edit2Icon } from "lucide-react";
import { Member } from "../@tabs/active/page";
import { MemberDetailsDialog } from "./member-details-dialog";
import { MemberRoleBadge } from "./member-role-badge";

export const MemberActions = ({
  member,
  className,
}: {
  member: Member;
  className?: string;
}) => {
  const canUpdateMember = useGuard({
    action: ["membership:update"],
  });

  return (
    <div className={cn("flex gap-1", className)}>
      <MemberRoleBadge
        memberRole={member.role as Role}
        memberId={member.id ?? ""}
      />
      {canUpdateMember && (
        <MemberDetailsDialog member={member}>
          <Badge variant={"outline"} className="cursor-pointer">
            <Edit2Icon />
          </Badge>
        </MemberDetailsDialog>
      )}
    </div>
  );
};
