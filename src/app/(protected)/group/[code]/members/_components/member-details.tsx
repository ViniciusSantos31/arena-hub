"use client";

import { getUserMembership } from "@/actions/group/membership";
import { updateMemberScore } from "@/actions/member/update-score";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGuard } from "@/hooks/use-guard";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/react-query";
import { getAvatarFallback } from "@/utils/avatar";
import { Role } from "@/utils/role";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserX2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Member } from "../page";
import { MemberRoleBadge } from "./member-role-badge";

export const MemberDetails = ({ member }: { member: Member }) => {
  const [score, setScore] = useState<number>(member.score as number);
  const { code } = useParams<{ code: string }>();
  const session = authClient.useSession();

  const { mutateAsync } = useMutation({
    mutationFn: async ({
      memberId,
      score,
    }: {
      memberId: string;
      score: number;
    }) =>
      await updateMemberScore({
        code,
        memberId,
        score,
      }),
    onSuccess: (_, variables) => {
      toast.success("Nota atualizada com sucesso");
      queryClient.setQueryData(
        ["active-members", code],
        (oldData: Member[]) => {
          return oldData.map((m) =>
            m.id === variables.memberId ? { ...m, score: variables.score } : m,
          );
        },
      );
    },
    onError: () => {
      toast.error("Não foi possível atualizar a nota");
    },
  });

  const canUpdateMember = useGuard({
    action: ["membership:update"],
  });

  const membership = useQuery({
    queryKey: ["membership", code],
    queryFn: async () =>
      await getUserMembership({
        organizationCode: code,
      }).then((res) => res.data),
  });

  const isCurrentUser = session?.data?.user?.id === member.userId;

  const canKickMember = useCallback(
    (role: Role | null = "guest") => {
      switch (role) {
        case "admin":
          return member.role !== "owner" && member.role !== "admin";
        case "owner":
          return true;
        default:
          return false;
      }
    },
    [member.role],
  );

  const handleChangeScore = async (newScore: number) => {
    setScore(newScore);
  };

  const saveScoreOnBlur = async () => {
    if (canUpdateMember && member.score !== score) {
      if (score > 50) {
        setScore(50);
        toast.error("A nota máxima é 50", {
          position: "bottom-center",
        });
        return;
      }
      await mutateAsync({ memberId: member.id as string, score });
    }
  };

  if (!membership.data) {
    return null;
  }

  return (
    <div className="@container/card flex h-fit flex-col">
      <div className="flex items-center justify-between gap-2 px-4">
        <div className="flex w-full items-center gap-3">
          <Avatar className="size-20 @lg/card:size-24">
            <AvatarImage src={member.image ?? undefined} alt={member.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              {getAvatarFallback(member.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <h3 className="text-foreground truncate font-medium">
              {member.name}
            </h3>
            <span className="text-muted-foreground truncate text-sm">
              {member.email}
            </span>
            <MemberRoleBadge
              memberRole={member.role as Role}
              memberId={member.id ?? ""}
            />
          </div>
        </div>
        {canUpdateMember && (
          <div className="space-y-2">
            <Label>Nota</Label>
            <Input
              placeholder="Nota"
              type="number"
              min={0}
              max={50}
              value={score}
              autoComplete="off"
              aria-autocomplete="none"
              onFocus={(e) => e.target.select()}
              onChange={(e) => handleChangeScore(Number(e.target.value))}
              onBlur={saveScoreOnBlur}
            />
          </div>
        )}
      </div>
      {canUpdateMember &&
        canKickMember(membership.data.role) &&
        !isCurrentUser && (
          <>
            <div className="bg-muted my-4 h-px w-full" />
            <section className="flex w-full px-4">
              <div className="ml-auto space-x-2">
                <Button variant={"destructive"}>
                  <UserX2Icon />
                  <span className="hidden @md/card:block">Expulsar Membro</span>
                  <span className="@md/card:hidden">Expulsar</span>
                </Button>
              </div>
            </section>
          </>
        )}
    </div>
  );
};
