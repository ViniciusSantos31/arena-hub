import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";

interface MemberCardProps {
  member: {
    id?: string;
    name?: string;
    email?: string;
    logo?: string;
    role?: string;
    score?: number;
    rank?: number;
    gamesPlayed?: number;
    winRate?: number;
  };
}

export const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.logo} alt={member.name} />
            <AvatarFallback>
              {getAvatarFallback(member.name ?? "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-muted-foreground text-sm">{member.email}</p>
          </div>
          <Badge variant="secondary">{member.role}</Badge>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium">{member.score}</p>
            <p className="text-muted-foreground text-xs">Score</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium">#{member.rank}</p>
            <p className="text-muted-foreground text-xs">Rank</p>
          </div>
          <div className="flex flex-1 flex-col">
            <p className="text-sm font-medium">{member.gamesPlayed ?? 0}</p>
            <p className="text-muted-foreground text-xs">jogos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
