"use client";

import { InviteStatusAlreadyMember } from "./status-views/status-already-member";
import { InviteStatusExpired } from "./status-views/status-expired";
import { InviteStatusGroupFull } from "./status-views/status-group-full";
import { InviteStatusInvalid } from "./status-views/status-invalid";
import { InviteStatusMaxUsesReached } from "./status-views/status-max-uses-reached";
import { InviteStatusOk } from "./status-views/status-ok";
import { InviteStatusRevoked } from "./status-views/status-revoked";

export type PreviewData =
  | { status: "invalid" }
  | {
      status: "revoked";
      group: { code: string; name: string; logo: string | null };
      revokedReason: string | null;
    }
  | {
      status: "expired";
      group: { code: string; name: string; logo: string | null };
      expiresAt: Date;
    }
  | {
      status: "max-uses-reached";
      group: { code: string; name: string; logo: string | null };
      maxUses: number;
      usesCount: number;
    }
  | {
      status: "group-full";
      group: { code: string; name: string; logo: string | null };
      maxPlayers: number;
      membersCount: number;
    }
  | {
      status: "already-member";
      group: { code: string; name: string; logo: string | null };
    }
  | {
      status: "ok";
      group: { code: string; name: string; logo: string | null };
      invite: {
        defaultRole: "guest" | "member";
        expiresAt: Date | null;
        maxUses: number | null;
        usesCount: number;
      };
    };

export function InviteGate({
  token,
  preview,
}: {
  token: string;
  preview: PreviewData;
}) {
  switch (preview.status) {
    case "ok":
      return (
        <InviteStatusOk
          token={token}
          groupName={preview.group.name}
          invite={preview.invite}
          groupLogo={preview.group.logo}
        />
      );
    case "already-member":
      return (
        <InviteStatusAlreadyMember
          groupCode={preview.group.code}
          groupName={preview.group.name}
          groupLogo={preview.group.logo}
        />
      );
    case "revoked":
      return (
        <InviteStatusRevoked
          groupName={preview.group.name}
          revokedReason={preview.revokedReason}
          groupLogo={preview.group.logo}
        />
      );
    case "expired":
      return (
        <InviteStatusExpired
          groupName={preview.group.name}
          expiresAt={preview.expiresAt}
          groupLogo={preview.group.logo}
        />
      );
    case "max-uses-reached":
      return (
        <InviteStatusMaxUsesReached
          groupName={preview.group.name}
          groupLogo={preview.group.logo}
        />
      );
    case "group-full":
      return (
        <InviteStatusGroupFull
          groupName={preview.group.name}
          groupLogo={preview.group.logo}
        />
      );
    case "invalid":
    default:
      return <InviteStatusInvalid />;
  }
}
