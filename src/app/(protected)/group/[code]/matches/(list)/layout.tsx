import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { use } from "react";
import { CreateMatchDialog } from "../_components/create-match-modal";
import { MatchFilterDropdown } from "../_components/match-filter-dropdown";
import { MatchesFilterProvider } from "../_contexts/matches-filter";

export default function MatchesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  return (
    <MatchesFilterProvider code={code}>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <CreateMatchDialog>
            <Button size="sm" className="h-9">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden @sm:inline">Nova Partida</span>
              <span className="@sm:hidden">Nova</span>
            </Button>
          </CreateMatchDialog>
          <MatchFilterDropdown />
        </div>

        {children}
      </div>
    </MatchesFilterProvider>
  );
}
