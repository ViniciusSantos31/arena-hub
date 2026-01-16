import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { Role } from "@/utils/role";
import { MemberRoleBadge } from "./member-role-badge";

interface MemberCardProps {
  member: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    role?: Role;
    score?: number;
    gamesPlayed?: number;
  };
}

export const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <Card className="bg-muted/30 hover:bg-muted/50 transition-all duration-200 dark:border-0">
      <CardContent>
        <div className="flex flex-col justify-between @md:flex-row @md:items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.image ?? undefined} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getAvatarFallback(member.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-foreground font-medium">{member.name}</h3>
              <p className="text-muted-foreground truncate text-sm">
                {member.email}
              </p>
              <MemberRoleBadge
                memberRole={member.role as Role}
                memberId={member.id ?? ""}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 @md:mt-0">
            <div>
              <p className="text-sm font-medium">{member.score ?? 0}</p>
              <p className="text-muted-foreground text-xs">Nota</p>
            </div>
            <div>
              <p className="text-sm font-medium">{member.gamesPlayed ?? 0}</p>
              <p className="text-muted-foreground text-xs">Partidas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MemberCardLoading = () => {
  return (
    <Card className="bg-muted/30 animate-pulse dark:border-0">
      <CardContent>
        <div className="flex flex-col justify-between @md:flex-row @md:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-12 min-w-12 rounded-full" />
            <div className="flex flex-col space-y-1 @md:space-y-0.5">
              <div className="bg-muted h-5 w-32 rounded @md:h-5.5" />
              <div className="bg-muted h-5 w-1/2 rounded @md:w-48" />
              <div className="bg-muted h-5.5 w-20 rounded" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 @md:mt-0">
            <div>
              <div className="bg-muted h-4 w-8 rounded" />
              <div className="bg-muted mt-1 h-3.5 w-16 rounded" />
            </div>
            <div>
              <div className="bg-muted h-4 w-8 rounded" />
              <div className="bg-muted mt-1 h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
