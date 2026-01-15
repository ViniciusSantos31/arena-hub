import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { MatchCardLoading } from "../_components/match-card";

export default function LoadingListMatches() {
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
          <Button
            variant="outline"
            className="flex-1 @xl:flex-none only:@xl:flex-none"
          >
            <FilterIcon className="h-4 w-4" />
            <span className="hidden @sm:inline">Filtros</span>
          </Button>

          <Button className="flex-1 @xl:flex-none only:@xl:flex-none">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden @sm:inline">Criar Partida</span>
            <span className="@sm:hidden">Criar</span>
          </Button>
        </div>
      </div>

      <MatchCardLoading />
      <MatchCardLoading />
      <MatchCardLoading />
    </div>
  );
}
