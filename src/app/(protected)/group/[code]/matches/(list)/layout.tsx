import { getGroupDetails } from "@/actions/group/detail";
import { Button } from "@/components/ui/button";
import {
  canOwnerCreateMatch,
  getOwnerPlanContextForOrganization,
} from "@/lib/user-plan/assertions";
import { PlusIcon } from "lucide-react";
import { CreateMatchDialog } from "../_components/create-match-modal";
import { MatchFilterDropdown } from "../_components/match-filter-dropdown";
import { MatchesFilterProvider } from "../_contexts/matches-filter";
import { MatchesPlanProvider } from "../_contexts/matches-plan";

export default async function MatchesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const groupResult = await getGroupDetails({ code });
  const group = groupResult.data;

  let ownerCanCreateMatch = true;
  if (group) {
    const ownerCtx = await getOwnerPlanContextForOrganization(group.id);
    ownerCanCreateMatch = ownerCtx ? canOwnerCreateMatch(ownerCtx) : true;
  }

  return (
    <MatchesFilterProvider code={code}>
      <MatchesPlanProvider ownerCanCreateMatch={ownerCanCreateMatch}>
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
      </MatchesPlanProvider>
    </MatchesFilterProvider>
  );
}
