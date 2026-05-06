"use client";

import { Role } from "@/utils/role";
import { BasicInfoForm } from "./basic-info-form";
import { ConfigAccessForm } from "./config-access-form";
import { InviteLinksSection } from "./invite-links-section";

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
      <InviteLinksSection
        group={{ code: group.code, private: group.private }}
      />
    </div>
  );
}
