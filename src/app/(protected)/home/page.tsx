import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import { GroupButton } from "./_components/group-button";

export default function ProtectedPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Bem-vindo ao Arena Hub
        </h1>
        <span className="text-muted-foreground block text-sm">
          Descubra novas conexões, crie grupos incríveis e faça parte da
          comunidade. Sua jornada começa aqui!
        </span>
      </div>

      <div className="grid w-full max-w-lg grid-cols-3 gap-4">
        <GroupButton label="Criar grupo" icon={PlusIcon} />
        <GroupButton label="Encontrar grupos" icon={SearchIcon} />
        <GroupButton label="Meus grupos" icon={UsersIcon} />
      </div>

      <section className="mt-12 border">
        <h2 className="mb-4 text-lg font-semibold">Seus grupos</h2>
        <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed">
          <span className="text-muted-foreground text-sm">
            Nenhuma novidade no momento.
          </span>
        </div>
      </section>
    </div>
  );
}
