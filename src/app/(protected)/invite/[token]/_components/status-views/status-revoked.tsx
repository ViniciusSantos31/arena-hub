import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BanIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusRevoked({
  groupName,
  revokedReason,
  groupLogo,
}: {
  groupName: string;
  revokedReason: string | null;
  groupLogo: string | null;
}) {
  const router = useRouter();

  return (
    <InviteCenteredShell
      groupLogo={groupLogo}
      icon={BanIcon}
      iconClassName="text-destructive"
      title="Convite cancelado"
      description={`Esse link pra entrar em ${groupName} foi desativado. Se precisar, pede um convite novo pra quem organiza o grupo.`}
      footer={
        <Button variant="secondary" onClick={() => router.replace("/home")}>
          <HomeIcon />
          Ir para o início
        </Button>
      }
    >
      {revokedReason ? (
        <Alert variant="destructive">
          <AlertTitle>Recado da organização</AlertTitle>
          <AlertDescription>{revokedReason}</AlertDescription>
        </Alert>
      ) : null}
    </InviteCenteredShell>
  );
}
