import { Button } from "@/components/ui/button";
import { HomeIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusGroupFull({
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
      icon={UsersIcon}
      iconClassName="text-muted-foreground"
      title="Grupo lotado por enquanto"
      description={`"${groupName}" já tá no limite de membros. Fala com a galera pra liberarem vaga ou aumentarem o limite e tenta de novo.`}
      footer={
        <Button variant="secondary" onClick={() => router.replace("/home")}>
          <HomeIcon />
          Ir para o início
        </Button>
      }
    />
  );
}
