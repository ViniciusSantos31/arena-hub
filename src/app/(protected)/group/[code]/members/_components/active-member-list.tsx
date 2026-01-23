"use client";

import { listMembers } from "@/actions/member/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Member } from "../page";
import { MemberCard } from "./member-card";

export const ActiveMemberList = ({
  members: serverMembers,
}: {
  members: Member[];
}) => {
  const { code } = useParams<{ code: string }>();
  const { data: members } = useQuery({
    queryKey: ["active-members", code],
    initialData: serverMembers,
    placeholderData: keepPreviousData,
    queryFn: async () =>
      await listMembers({
        organizationCode: code,
      }).then((res) => res.data || []),
  });

  if (members.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Nenhum membro ativo encontrado
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
};
