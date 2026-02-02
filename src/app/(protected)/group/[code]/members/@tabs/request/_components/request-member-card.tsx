"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { Check, X } from "lucide-react";

interface RequestMemberCardProps {
  member: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    requestDate?: string;
  };
  onAccept?: (memberId: string) => void;
  onReject?: (memberId: string) => void;
  loading?: boolean;
}

export const RequestMemberCard = ({
  member,
  onAccept,
  onReject,
  loading = false,
}: RequestMemberCardProps) => {
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
              <Badge variant="secondary" className="text-xs">
                Solicitação pendente
              </Badge>
            </div>
          </div>
          <div className="mt-4 ml-auto flex items-center gap-2 @md:mt-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onReject?.(member.id!)}
              disabled={loading || !member.id}
            >
              <X className="h-4 w-4" />
              Recusar
            </Button>
            <Button
              size="sm"
              onClick={() => onAccept?.(member.id!)}
              disabled={loading || !member.id}
            >
              <Check className="h-4 w-4" />
              Aceitar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RequestMemberCardLoading = () => {
  return (
    <Card className="bg-muted/30 animate-pulse dark:border-0">
      <CardContent>
        <div className="flex flex-col justify-between @md:flex-row @md:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-12 min-w-12 rounded-full" />
            <div className="flex flex-col space-y-1 @md:space-y-0.5">
              <div className="bg-muted h-5 w-32 rounded @md:h-5.5" />
              <div className="bg-muted h-5 w-1/2 rounded @md:w-48" />
              <div className="bg-muted h-5.5 w-28 rounded" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 @md:mt-0">
            <div className="bg-muted h-9 w-20 rounded" />
            <div className="bg-muted h-9 w-20 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
