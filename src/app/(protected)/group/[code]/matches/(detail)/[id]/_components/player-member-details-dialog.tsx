"use client";

import { getMemberById } from "@/actions/member/get-by-id";
import { MemberDetailsDialog } from "@/app/(protected)/group/[code]/members/_components/member-details-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface PlayerMemberDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  organizationCode: string;
}

export function PlayerMemberDetailsDialog({
  open,
  onOpenChange,
  memberId,
  organizationCode,
}: PlayerMemberDetailsDialogProps) {
  const { data: member, isLoading } = useQuery({
    queryKey: ["member-details", memberId],
    enabled: open && !!memberId,
    queryFn: async () =>
      getMemberById({ memberId, organizationCode }).then((res) => res?.data),
  });

  if (isLoading || !member) {
    return (
      <div className="hidden">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <MemberDetailsDialog
      open={open}
      onOpenChange={onOpenChange}
      member={member}
    />
  );
}
