import { PlusIcon, SearchIcon } from "lucide-react";
import { GroupButton } from "./_components/group-button";

export default function ProtectedPage() {
  return (
    <div className="container flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Bem-vindo ao Arena Hub
        </h1>
        <span className="text-muted-foreground block text-sm">
          Descubra novas conexões, crie grupos incríveis e faça parte da
          comunidade. Sua jornada começa aqui!
        </span>
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-4">
        <GroupButton label="Criar grupo" icon={PlusIcon} />
        <GroupButton label="Encontrar grupos" icon={SearchIcon} />
      </div>
    </div>
  );
}
