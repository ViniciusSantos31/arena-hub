import { redirect } from "next/navigation";

export default async function GroupInviteConsumePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/invite/${token}`);
}
