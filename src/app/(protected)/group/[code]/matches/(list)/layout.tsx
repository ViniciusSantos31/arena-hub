import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { CreateMatchDialog } from "../_components/create-match-modal";

export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 @xl:flex @xl:items-center @xl:justify-between @xl:gap-4 @xl:space-y-0">
        {/* Search input - full width on mobile */}
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input placeholder="Buscar partidas..." className="w-full pl-10" />
        </div>

        {/* Action buttons - horizontal on mobile, responsive sizing */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 @xl:flex-none"
              >
                <FilterIcon className="h-4 w-4" />
                <span className="hidden @sm:inline">Filtros</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <CalendarIcon className="h-4 w-4" />
                Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UsersIcon className="h-4 w-4" />
                Participantes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TrophyIcon className="h-4 w-4" />
                Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Limpar filtros</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateMatchDialog>
            <Button size="sm" className="flex-1 @xl:flex-none">
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
