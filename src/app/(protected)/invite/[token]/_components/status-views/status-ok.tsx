import { consumeInviteLink } from "@/actions/invite-links/consume";
import { Button } from "@/components/ui/button";
import { getRoleLabel } from "@/utils/role";
import { CheckCircle2Icon, SparklesIcon, UserCheckIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusOk({
  token,
  groupName,
  groupLogo,
  invite,
}: {
  token: string;
  groupName: string;
  groupLogo: string | null;
  invite: {
    defaultRole: "guest" | "member";
    expiresAt: Date | null;
    maxUses: number | null;
    usesCount: number;
  };
}) {
  const router = useRouter();

  const consumeAction = useAction(consumeInviteLink, {
    onSuccess({ data }) {
      if (data?.organizationCode) {
        router.replace(`/group/${data.organizationCode}/members`);
      } else {
        router.replace("/home");
      }
    },
  });

  return (
    <InviteCenteredShell
      groupLogo={groupLogo}
      icon={SparklesIcon}
      iconClassName="text-primary"
      title={`Bora pro grupo "${groupName}"?`}
      description={`Tá tudo certo com esse convite. Clica aí pra entrar e colar com a galera.`}
      footer={
        <Button
          disabled={consumeAction.isExecuting}
          onClick={() => consumeAction.executeAsync({ token })}
          type="button"
        >
          <CheckCircle2Icon />
          {consumeAction.isExecuting ? "Entrando..." : "Entrar no grupo"}
        </Button>
      }
    >
      <div className="border-primary/50 bg-muted/25 ring-border/40 shadow-primary/25 rounded-xl border px-4 py-3 text-left shadow-lg ring-1">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <UserCheckIcon className="h-4 w-4 shrink-0" />
          Você vai entrar como
        </div>
        <div className="text-foreground mt-1 text-sm font-semibold">
          {getRoleLabel(invite.defaultRole)}
        </div>
      </div>
    </InviteCenteredShell>
  );
}
