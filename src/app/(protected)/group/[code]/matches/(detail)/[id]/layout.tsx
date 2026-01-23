import { db } from "@/db";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { redirect } from "next/navigation";

export default async function MatchDetailLayout({
  children,
  params,
}: {
  params: Promise<{ id: string; code: string }>;
  children: React.ReactNode;
}) {
  const { id, code } = await params;

  const match = await db.query.matchesTable.findFirst({
    where: (matchesTable, { eq }) => eq(matchesTable.id, id),
  });

  if (!match) {
    redirect(`/group/${code}/matches`);
  }

  return <WebSocketProvider>{children}</WebSocketProvider>;
}
