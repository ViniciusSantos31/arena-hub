"use client";

import { updateMemberRole } from "@/actions/member/update-role";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { getRoleLabel, Role } from "@/utils/role";
import { ChevronDownIcon } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useMemberStore } from "../../_store/group";
import { Member } from "../page";

export const MemberRoleBadge = ({
  memberRole,
  memberId,
}: {
  memberRole: Role;
  memberId: string;
}) => {
  const canUpdateMembership = useGuard({
    action: ["membership:update"],
  });

  const memberStore = useMemberStore();
  const { code } = useParams<{ code: string }>();

  const updateMemberRoleAction = useOptimisticAction(updateMemberRole, {
    currentState: memberRole,
    updateFn: (_, input) => input.role,
    onSuccess({ input }) {
      queryClient.setQueryData(
        ["active-members", code],
        (oldData: Member[]) => {
          return oldData.map((m) =>
            m.id === input.memberId ? { ...m, role: input.role } : m,
          );
        },
      );
      toast.success("Função do membro atualizada com sucesso");
    },
  });

  const handleChangeRole = async (role: Exclude<Role, "owner">) => {
    await updateMemberRoleAction
      .executeAsync({
        memberId,
        role,
        code,
      })
      .catch(() => {
        toast.error("Erro ao atualizar a função do membro");
      });
  };

  const isOwner = memberStore.member?.role === "owner";

  if (
    !canUpdateMembership ||
    memberRole === "owner" ||
    memberStore.member?.id === memberId ||
    (memberStore.member?.role === "admin" && memberRole === "admin")
  ) {
    return (
      <Badge variant="outline" className="rounded-xl p-1 px-2 text-xs">
        {getRoleLabel(memberRole)}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger tabIndex={0}>
        <Badge
          variant={"outline"}
          className="rounded-xl p-1 px-2 text-xs hover:cursor-pointer"
        >
          {getRoleLabel(updateMemberRoleAction.optimisticState)}
          <ChevronDownIcon />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {isOwner && (
          <DropdownMenuItem onClick={() => handleChangeRole("admin")}>
            {getRoleLabel("admin")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleChangeRole("member")}>
          {getRoleLabel("member")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChangeRole("guest")}>
          {getRoleLabel("guest")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
