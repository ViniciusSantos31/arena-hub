"use client";

import { use } from "react";
import { EmptyRequestList } from "./_components/request-empty-list";
import { RequestMemberCard } from "./_components/request-member-card";
import { useMemberRequests } from "./_hooks";
import GroupRequestLoading from "./loading";

export default function RequestPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { data: requests, isLoading } = useMemberRequests(code);

  if (requests && requests.length === 0) {
    return <EmptyRequestList />;
  }

  if (isLoading) {
    return <GroupRequestLoading />;
  }

  return (
    <div className="flex h-full flex-col gap-4 pt-4">
      <div className="space-y-4">
        {requests?.map((request) => (
          <RequestMemberCard
            key={request.id}
            request={request}
            member={{
              id: request.id,
              email: request.user?.email,
              image: request.user?.image,
              name: request.user?.name,
            }}
          />
        ))}
      </div>
    </div>
  );
}
