import { Button } from "@/components/ui/button";
import { ClockIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR");
}

export function InviteStatusExpired({
  groupName,
  expiresAt,
  groupLogo,
}: {
  groupName: string;
  expiresAt: Date;
  groupLogo: string | null;
}) {
  const router = useRouter();

  return (
    <InviteCenteredShell
      groupLogo={groupLogo}
      icon={ClockIcon}
      iconClassName="text-muted-foreground"
      title="Convite expirou"
      description={`Esse link pra entrar em "${groupName}" já passou da validade (expirou em ${formatDateTime(expiresAt)}). Pede um convite novo e cola com a galera.`}
      footer={
        <Button
          className="ml-auto"
          variant="secondary"
          onClick={() => router.replace("/home")}
        >
          <HomeIcon />
          Voltar
        </Button>
      }
    />
  );
}
