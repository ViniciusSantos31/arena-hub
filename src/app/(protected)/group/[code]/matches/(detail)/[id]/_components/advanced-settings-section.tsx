"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGuard } from "@/hooks/use-guard";
import { useMatch } from "../_hooks/useMatch";
import { CancelMatchButton } from "./cancel-match-button";
import { CloseRegistrationButton } from "./close-registration-button";
import { CompleteMatchButton } from "./complete-match-button";
import { DeleteMatchButton } from "./delete-match-button";
import { ShuffleTeamsButton } from "./shuffle-teams-button";

export const AdvancedSettingsSection = () => {
  const canModifyMatch = useGuard({
    action: ["match:update", "team:create"],
  });

  const { data: match } = useMatch();

  if (!canModifyMatch || match?.status === "completed") {
    return null;
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-sm font-semibold">
          Configurações avançadas
        </CardTitle>
        <CardDescription className="text-xs">
          Visível apenas para você e outros moderadores do grupo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <CompleteMatchButton />
        <ShuffleTeamsButton />
        <CloseRegistrationButton />
        <CancelMatchButton />
        <DeleteMatchButton />
      </CardContent>
    </Card>
  );
};
