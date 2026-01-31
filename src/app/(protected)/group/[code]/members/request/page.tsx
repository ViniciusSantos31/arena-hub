"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { EmptyRequestList } from "./_components/request-empty-list";
import { RequestMemberCard } from "./_components/request-member-card";

export default function RequestPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [requests, setRequests] = useState([
    // Mock data - replace with actual API call
    {
      id: "1",
      name: "João Silva",
      email: "joao@email.com",
      avatar: "/avatars/joao.jpg",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@email.com",
      avatar: "/avatars/maria.jpg",
    },
  ]);

  const handleAccept = (id: string) => {
    setRequests(requests.filter((req) => req.id !== id));
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter((req) => req.id !== id));
  };

  if (requests.length === 0) {
    return <EmptyRequestList />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/group/${code}/members`}>
          <ChevronLeftIcon />
          Ver membros do grupo
        </Link>
      </Button>
      <div className="space-y-4">
        {requests.map((request) => (
          <RequestMemberCard
            key={request.id}
            member={{
              id: request.id,
              email: request.email,
              image: request.avatar,
              name: request.name,
            }}
            onAccept={() => handleAccept(request.id)}
            onReject={() => handleReject(request.id)}
          />
        ))}
      </div>
    </div>
  );
}
