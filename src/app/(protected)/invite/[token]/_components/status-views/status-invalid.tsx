import { Button } from "@/components/ui/button";
import { HomeIcon, Link2OffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusInvalid() {
  const router = useRouter();
  return (
    <InviteCenteredShell
      groupLogo={null}
      icon={Link2OffIcon}
      iconClassName="text-muted-foreground"
      title="Opa… esse convite não rolou"
      description="Esse link tá inválido (ou foi digitado/copidado errado). Pede um novo link pra galera do grupo e tenta de novo."
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
