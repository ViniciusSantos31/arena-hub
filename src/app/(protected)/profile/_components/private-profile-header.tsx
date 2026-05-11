import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getAvatarFallback } from "@/utils/avatar";
import {
  ExternalLinkIcon,
  MapPinIcon,
  SearchIcon,
  SwordsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

interface PrivateProfileHeaderProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  bio?: string | null;
  location?: string | null;
  lookingForGroup?: boolean;
  stats?: {
    matches: number;
    groups: number;
  };
}

export function PrivateProfileHeader({
  user,
  bio,
  location,
  lookingForGroup,
  stats,
}: PrivateProfileHeaderProps) {
  const statItems = [
    { label: "Partidas", value: stats?.matches ?? 0, icon: SwordsIcon },
    { label: "Grupos", value: stats?.groups ?? 0, icon: UsersIcon },
  ];

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {user?.image && (
            <AvatarImage
              width={1080}
              height={1080}
              src={user.image}
              alt={user?.name ?? ""}
            />
          )}
          <AvatarFallback className="text-3xl font-semibold">
            {getAvatarFallback(user?.name ?? "")}
          </AvatarFallback>
        </Avatar>
        {lookingForGroup && (
          <span className="border-background bg-primary absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2">
            <SearchIcon className="h-3 w-3 text-white" />
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-2xl font-bold tracking-tight">
          {user?.name ?? "Jogador"}
        </span>
        <span className="text-muted-foreground text-sm">{user?.email}</span>

        {location && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPinIcon className="h-3.5 w-3.5" />
            {location}
          </span>
        )}

        {bio && (
          <p className="text-muted-foreground mt-1 max-w-xs text-sm">{bio}</p>
        )}

        {lookingForGroup && (
          <Badge variant="secondary" className="mt-1 gap-1.5 text-xs">
            <SearchIcon className="h-3 w-3" />
            Procurando grupo
          </Badge>
        )}
      </div>

      <Link
        href={`/profile/${user?.id ?? ""}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <ExternalLinkIcon className="h-4 w-4" />
        Ver perfil público
      </Link>

      <div className="grid w-full max-w-xs grid-cols-2 gap-2.5">
        {statItems.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-muted/40 rounded-xl p-3.5">
            <div className="bg-primary/10 mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg">
              <Icon className="text-primary h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
