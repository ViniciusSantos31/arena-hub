import { consumeInviteLink } from "@/actions/invite-links/consume";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
          className="ml-auto"
        >
          <CheckCircle2Icon />
          {consumeAction.isExecuting ? "Entrando..." : "Entrar no grupo"}
        </Button>
      }
    >
      <div className="grid gap-3">
        <Card className="border-border/60 bg-muted/20 gap-2 px-4 py-4 shadow-none">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <UserCheckIcon className="h-4 w-4" />
            Você vai entrar como
          </div>
          <div className="text-sm font-semibold">
            {getRoleLabel(invite.defaultRole)}
          </div>
        </Card>
      </div>
    </InviteCenteredShell>
  );
}
