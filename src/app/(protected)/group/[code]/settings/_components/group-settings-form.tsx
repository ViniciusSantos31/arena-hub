"use client";

import { Role } from "@/utils/role";
import { BasicInfoForm } from "./basic-info-form";
import { ConfigAccessForm } from "./config-access-form";
import { DeleteGroupButton } from "./delete-group-button";
import { InviteLinksSection } from "./invite-links-section";
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
      <BasicInfoForm group={group} userRole={userRole} id="basic-info" />
      <ConfigAccessForm group={group} userRole={userRole} id="config-access" />
      <InviteLinksSection
        group={{ code: group.code, private: group.private }}
        id="invite-links"
      />
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
