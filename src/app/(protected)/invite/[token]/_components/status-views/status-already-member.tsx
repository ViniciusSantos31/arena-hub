import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusAlreadyMember({
  groupCode,
  groupName,
  groupLogo,
}: {
  groupCode: string;
  groupName: string;
  groupLogo: string | null;
}) {
  const router = useRouter();

  return (
    <InviteCenteredShell
      groupLogo={groupLogo}
      icon={LogInIcon}
      iconClassName="text-primary"
      title="Você já tá no grupo"
      description={`Você já é membro do grupo "${groupName}". Só entrar e partir pro jogo.`}
      footer={
        <Button onClick={() => router.replace(`/group/${groupCode}/members`)}>
          Ir para o grupo
        </Button>
      }
    />
  );
}
