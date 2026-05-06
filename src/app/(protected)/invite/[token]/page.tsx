import { previewInviteLink } from "@/actions/invite-links/preview";
import { InviteGate } from "./_components/invite-gate";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const res = await previewInviteLink({ token });
  const preview = res.data ?? { status: "invalid" as const };

  return <InviteGate token={token} preview={preview} />;
}
