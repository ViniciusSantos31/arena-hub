import { Button } from "@/components/ui/button";
import { GaugeIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusMaxUsesReached({
  groupName,
  groupLogo,
}: {
  groupName: string;
  groupLogo: string | null;
}) {
  const router = useRouter();

  return (
    <InviteCenteredShell
      groupLogo={groupLogo}
      icon={GaugeIcon}
      iconClassName="text-muted-foreground"
      title="Convite já foi usado demais"
      description={`Esse link pra entrar no grupo "${groupName}" já bateu no limite de usos. Pede pra galera gerar outro e bora.`}
      footer={
        <Button variant="secondary" onClick={() => router.replace("/home")}>
          <HomeIcon />
          Ir para o início
        </Button>
      }
    />
  );
}
