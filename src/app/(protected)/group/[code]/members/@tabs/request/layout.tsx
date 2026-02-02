"use client";

import { useGuard } from "@/hooks/use-guard";
import { redirect } from "next/navigation";
import { use } from "react";

export default function MembersRequestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const canHandleRequests = useGuard({
    action: ["membership:approve"],
  });

  if (!canHandleRequests) {
    return redirect(`/group/${code}/members`);
  }

  return children;
}
