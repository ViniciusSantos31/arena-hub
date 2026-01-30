import { GraduationCapIcon, PlusIcon, SearchIcon, ZapIcon } from "lucide-react";
import { GroupButton } from "./_components/group-button";

export default function ProtectedPage() {
  return (
    <div className="bg-background flex h-full w-full flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="from-primary to-secondary mb-4 bg-gradient-to-r bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          Arena Hub
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-balance">
          Conecte-se com outros gamers, crie grupos e organize suas sessões de
          jogo em um só lugar.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="w-full max-w-md space-y-4">
        <div className="mb-6 flex items-center justify-center gap-2">
          <ZapIcon className="text-primary h-6 w-6" />
          <h2 className="font-semibold">Ações Rápidas</h2>
        </div>
        <div className="space-y-4">
          <GroupButton
            label="Criar grupo"
            icon={PlusIcon}
            href="group/create"
          />
          <GroupButton label="Encontrar grupos" icon={SearchIcon} href="feed" />
          <GroupButton
            label="Entenda o App"
            icon={GraduationCapIcon}
            href="learn-more"
          />
        </div>
      </div>
    </div>
  );
}
