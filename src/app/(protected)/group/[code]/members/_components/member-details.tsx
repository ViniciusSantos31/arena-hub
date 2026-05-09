"use client";

import { getUserMembership } from "@/actions/group/membership";
import { kickMember as kickMemberAction } from "@/actions/member/kick";
import { updateMemberScore } from "@/actions/member/update-score";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGuard } from "@/hooks/use-guard";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/react-query";
import { getAvatarFallback } from "@/utils/avatar";
import { Role } from "@/utils/role";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ShieldIcon, StarIcon, UserX2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Member } from "../@tabs/active/page";
import { MemberRoleBadge } from "./member-role-badge";

export const MemberDetails = ({ member }: { member: Member }) => {
  const [score, setScore] = useState<number>(member.score as number);
  const { code } = useParams<{ code: string }>();
  const session = authClient.useSession();

  const { mutateAsync: kickMember, isPending: kickMemberIsPending } =
    useMutation({
      mutationFn: async (memberId: string) => {
        await kickMemberAction({
          memberId,
          organizationCode: code,
        });
      },
      onSuccess: () => {
        toast.success("Membro expulso com sucesso");
        queryClient.invalidateQueries({
          queryKey: ["active-members", code],
        });
      },
    });

  const handleKickMember = (memberId?: string) => {
    if (!memberId) return;
    kickMember(memberId);
  };

  const { mutateAsync: updateScoreMember } = useMutation({
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
      await updateScoreMember({ memberId: member.id as string, score });
    }
  };

  if (!membership.data) {
    return null;
  }

  return (
    <div className="@container/card flex h-fit flex-col gap-4">
      <div className="flex flex-col items-center gap-3 px-4 pt-2 text-center">
        <Avatar className="ring-primary/10 size-20 ring-2 ring-offset-2">
          <AvatarImage src={member.image ?? undefined} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
            {getAvatarFallback(member.name ?? "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-foreground font-semibold">{member.name}</h3>
          <span className="text-muted-foreground text-sm">{member.email}</span>
          <MemberRoleBadge
            memberRole={member.role as Role}
            memberId={member.id ?? ""}
          />
        </div>
      </div>

      <div className="mx-12 flex items-center justify-center gap-4">
        <Badge
          variant="secondary"
          className="shadow-primary/20 border-primary/50 bg-primary/10 flex flex-col items-center gap-1 border-b-3 py-2 shadow-lg"
        >
          <div className="flex items-center gap-1.5 text-amber-500">
            <StarIcon className="h-4 w-4" />
            <span className="text-foreground text-lg font-bold tabular-nums">
              {score ?? 0}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
            Nota
          </span>
        </Badge>
        <Badge
          variant="secondary"
          className="shadow-primary/20 border-primary/50 bg-primary/10 flex flex-col items-center gap-1 border-b-3 py-2 shadow-lg"
        >
          <div className="flex items-center gap-1.5">
            <ShieldIcon className="text-primary/60 h-4 w-4" />
            <span className="text-foreground text-lg font-bold tabular-nums">
              {member.matches ?? 0}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
            Partidas
          </span>
        </Badge>
      </div>

      {canUpdateMember && (
        <div className="space-y-2 px-4">
          <Label htmlFor="member-score">Ajustar nota</Label>
          <Input
            id="member-score"
            placeholder="0 – 50"
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

      {canUpdateMember &&
        canKickMember(membership.data.role) &&
        !isCurrentUser && (
          <>
            <div className="bg-border h-px w-full" />
            <section className="flex w-full px-4 pb-1">
              <div className="ml-auto">
                <Button
                  variant="destructive"
                  disabled={!member.id || kickMemberIsPending}
                  onClick={() => handleKickMember(member.id)}
                >
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
