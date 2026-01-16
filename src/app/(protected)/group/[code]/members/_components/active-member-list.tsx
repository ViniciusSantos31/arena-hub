import { Member } from "../page";
import { MemberCard } from "./member-card";

export const ActiveMemberList = ({ members }: { members: Member[] }) => {
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
