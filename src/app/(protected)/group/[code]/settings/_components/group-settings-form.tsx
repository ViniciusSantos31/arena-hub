"use client";

import { Role } from "@/utils/role";
import { BasicInfoForm } from "./basic-info-form";
import { ConfigAccessForm } from "./config-access-form";
import { DeleteGroupButton } from "./delete-group-button";
import { InviteLinksSection } from "./invite-links-section";
import { PunishmentConfigForm } from "./punishment-config-form";
import { SettingsSection } from "./settings-section";
import { StripeConnectSection } from "./stripe-connect-section";

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
    punishmentsToSuspend: number;
    suspensionMatchCount: number;
    stripeAccountId: string | null;
  };
  userRole: Role;
}

export function GroupSettingsForm({ group, userRole }: GroupSettingsFormProps) {
  return (
    <div className="space-y-4">
      <BasicInfoForm group={group} userRole={userRole} id="basic-info" />
      <ConfigAccessForm group={group} userRole={userRole} id="config-access" />
      <PunishmentConfigForm
        group={group}
        userRole={userRole}
        id="punishment-config"
      />
      <InviteLinksSection group={{ code: group.code }} id="invite-links" />
      {(userRole === "owner" || userRole === "admin") && (
        <StripeConnectSection
          group={{
            id: group.id,
            code: group.code,
            stripeAccountId: group.stripeAccountId,
          }}
          id="payments"
        />
      )}
      {userRole === "owner" && (
        <SettingsSection
          id="danger-zone"
          variant="destructive"
          title="Zona de perigo"
          description="Ações irreversíveis que afetam todo o grupo."
        >
          <DeleteGroupButton group={{ name: group.name, code: group.code }} />
        </SettingsSection>
      )}
    </div>
  );
}
