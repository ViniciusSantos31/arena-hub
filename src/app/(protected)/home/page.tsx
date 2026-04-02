import { GraduationCapIcon, PlusIcon, SearchIcon } from "lucide-react";
import { GroupButton } from "./_components/group-button";

export default function ProtectedPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="from-primary to-primary/60 mb-3 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            Arena Hub
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Organize partidas, gerencie membros e simplifique seus pagamentos.
          </p>
        </div>

        <div className="space-y-3">
          <GroupButton
            label="Criar grupo"
            description="Configure um novo grupo de jogadores"
            icon={PlusIcon}
            href="group/create"
          />
          <GroupButton
            label="Encontrar grupos"
            description="Explore e entre em grupos públicos"
            icon={SearchIcon}
            href="feed"
          />
          <GroupButton
            label="Como usar o app"
            description="Guia rápido para aproveitar tudo"
            icon={GraduationCapIcon}
            href="learn-more"
          />
        </div>
      </div>
    </div>
  );
}
