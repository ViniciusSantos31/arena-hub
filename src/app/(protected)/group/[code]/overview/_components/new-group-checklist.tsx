"use client";

import { listInviteLinks } from "@/actions/invite-links/list";
import { useMemberStore } from "@/app/(protected)/group/[code]/_store/group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, CircleIcon, SparklesIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";

type NewGroupChecklistProps = {
  code: string;
  matchesCount: number;
  membersCount: number;
};

function ChecklistItem({
  done,
  title,
  description,
  href,
  cta,
}: {
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="border-border/60 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          {done ? (
            <CheckCircle2Icon className="text-primary mt-0.5 size-4 shrink-0" />
          ) : (
            <CircleIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          )}
          <div className="min-w-0">
            <div
              className={cn(
                "text-sm font-semibold",
                done && "text-muted-foreground line-through",
              )}
            >
              {title}
            </div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </div>
          </div>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        variant={done ? "outline" : "default"}
        className="sm:shrink-0"
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}

export function NewGroupChecklist({
  code,
  matchesCount,
  membersCount,
}: NewGroupChecklistProps) {
  const member = useMemberStore((s) => s.member);
  const isOwner = member?.role === "owner";

  const listAction = useAction(listInviteLinks);

  const { data: inviteLinksCount } = useQuery({
    queryKey: ["invite-links-count", code],
    enabled: isOwner,
    queryFn: async () => {
      const res = await listAction.executeAsync({ organizationCode: code });
      return res.data?.links?.length ?? 0;
    },
  });

  if (!isOwner) return null;

  const hasInviteLink = (inviteLinksCount ?? 0) > 0;
  const hasInvitedSomeone = membersCount > 1;
  const hasMatch = matchesCount > 0;

  return (
    <Card className="border-border/60 bg-muted/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <SparklesIcon className="text-primary size-4" />
          </span>
          Primeiros passos
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Configure o grupo para começar a jogar.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChecklistItem
          done={hasInviteLink}
          title="Crie seu link de convite"
          description="Gere um link e compartilhe com seus amigos."
          href={`/group/${code}/settings`}
          cta={hasInviteLink ? "Ver ajustes" : "Criar link"}
        />
        <ChecklistItem
          done={hasInvitedSomeone}
          title="Convide seu grupo"
          description="Traga pelo menos mais 1 pessoa para o grupo."
          href={`/group/${code}/members`}
          cta={hasInvitedSomeone ? "Ver membros" : "Convidar"}
        />
        <ChecklistItem
          done={hasMatch}
          title="Crie sua primeira partida"
          description="Cadastre uma partida para começar a organizar os jogos."
          href={`/group/${code}/matches`}
          cta={hasMatch ? "Ver partidas" : "Criar partida"}
        />
      </CardContent>
    </Card>
  );
}
