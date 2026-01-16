import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import { CreateMatchDialog } from "../_components/create-match-modal";

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search input - full width on mobile */}
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input placeholder="Buscar partidas..." className="w-full pl-10" />
        </div>

        {/* Action buttons - horizontal on mobile, responsive sizing */}
        <div className="flex gap-2">
          <CreateMatchDialog>
            <Button className="ml-auto">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden @sm:inline">Criar Partida</span>
              <span className="@sm:hidden">Criar</span>
            </Button>
          </CreateMatchDialog>
        </div>
      </div>

      {children}
    </div>
  );
}
