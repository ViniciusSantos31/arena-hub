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
    <Card>
      <CardHeader>
        <CardTitle>Configurações avançadas</CardTitle>
        <CardDescription>
          Só você e outros moderadores do grupo podem ver e alterar essas
          configurações.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CompleteMatchButton />
        <ShuffleTeamsButton />
        <CloseRegistrationButton />
        <CancelMatchButton />
        <DeleteMatchButton />
      </CardContent>
    </Card>
  );
};
