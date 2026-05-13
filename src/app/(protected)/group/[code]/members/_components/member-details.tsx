"use client";

import { getUserMembership } from "@/actions/group/membership";
import { kickMember as kickMemberAction } from "@/actions/member/kick";
import { removePunishment as removePunishmentAction } from "@/actions/member/remove-punishment";
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
import {
  AlertTriangleIcon,
  BanIcon,
  ShieldIcon,
  ShieldOffIcon,
  StarIcon,
  UserX2Icon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Member } from "../@tabs/active/page";
import { MemberRoleBadge } from "./member-role-badge";
import { PunishMemberDialog } from "./punish-member-dialog";

export const MemberDetails = ({ member }: { member: Member }) => {
  const [score, setScore] = useState<number>(member.score as number);
  const [isPunishDialogOpen, setIsPunishDialogOpen] = useState(false);
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

  const {
    mutateAsync: removePunishment,
    isPending: removePunishmentIsPending,
  } = useMutation({
    mutationFn: async (memberId: string) => {
      await removePunishmentAction({
        memberId,
        organizationCode: code,
      });
    },
    onSuccess: () => {
      toast.success("Punição removida com sucesso");
      queryClient.invalidateQueries({
        queryKey: ["active-members", code],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-details", member.id],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível remover a punição",
      );
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

  const showMemberActions =
    canUpdateMember &&
    canKickMember(membership.data.role) &&
    !isCurrentUser;

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
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <MemberRoleBadge
              memberRole={member.role as Role}
              memberId={member.id ?? ""}
            />
            {member.isSuspended && (
              <Badge
                variant="destructive"
                className="flex items-center gap-1 text-xs"
              >
                <BanIcon className="h-3 w-3" />
                Suspenso
              </Badge>
            )}
          </div>
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
        {showMemberActions && (
          <Badge
            variant="secondary"
            className="shadow-primary/20 border-primary/50 bg-primary/10 flex flex-col items-center gap-1 border-b-3 py-2 shadow-lg"
          >
            <div className="flex items-center gap-1.5 text-orange-500">
              <AlertTriangleIcon className="h-4 w-4" />
              <span className="text-foreground text-lg font-bold tabular-nums">
                {member.punishmentCount ?? 0}
              </span>
            </div>
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
              Punições
            </span>
          </Badge>
        )}
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

      {showMemberActions && (
        <>
          <div className="bg-border h-px w-full" />
          <section className="flex w-full flex-wrap gap-2 px-4 pb-1">
            <Button
              variant="outline"
              className="border-orange-500/50 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950/20"
              disabled={!member.id}
              onClick={() => setIsPunishDialogOpen(true)}
            >
              <AlertTriangleIcon className="h-4 w-4" />
              <span className="hidden @md/card:block">Punir Membro</span>
              <span className="@md/card:hidden">Punir</span>
            </Button>

            {((member.punishmentCount ?? 0) > 0 || member.isSuspended) && (
              <Button
                variant="outline"
                className="border-green-500/50 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/20"
                disabled={!member.id || removePunishmentIsPending}
                onClick={() => removePunishment(member.id!)}
              >
                <ShieldOffIcon className="h-4 w-4" />
                <span className="hidden @md/card:block">Remover Punição</span>
                <span className="@md/card:hidden">Remover</span>
              </Button>
            )}

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

          <PunishMemberDialog
            open={isPunishDialogOpen}
            onOpenChange={setIsPunishDialogOpen}
            member={{ id: member.id, name: member.name }}
            organizationCode={code}
          />
        </>
      )}
    </div>
  );
};
