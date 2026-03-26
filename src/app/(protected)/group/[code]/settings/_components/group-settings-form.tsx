"use client";

import { Button } from "@/components/ui/button";
import { Role } from "@/utils/role";
import { CreditCardIcon } from "lucide-react";
import Link from "next/link";
import { BasicInfoForm } from "./basic-info-form";
import { ConfigAccessForm } from "./config-access-form";
import { SettingsSection } from "./settings-section";

interface GroupSettingsFormProps {
  group: {
    id: string;
    name: string;
    code: string;
    logo: string;
    rules: string | null;
    private: boolean;
    maxPlayers: number;
    description?: string | null;
  };
  userRole: Role;
}

export function GroupSettingsForm({ group, userRole }: GroupSettingsFormProps) {
  return (
    <div className="space-y-4">
      <BasicInfoForm group={group} userRole={userRole} />
      <ConfigAccessForm group={group} userRole={userRole} />

      <SettingsSection
        title="Pagamentos"
        description="Configure os recebimentos para criar partidas pagas."
      >
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex flex-col space-y-1">
            <h4 className="font-medium">Recebimentos via Stripe</h4>
            <p className="text-muted-foreground text-sm">
              Cadastre sua conta bancária para receber os pagamentos das partidas.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/group/${group.code}/settings/billing`}>
              <CreditCardIcon className="h-4 w-4" />
              Configurar
            </Link>
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
