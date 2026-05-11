import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPinIcon } from "lucide-react";

interface PublicProfileHeaderProps {
  user: {
    name: string;
    image?: string | null;
    bio?: string;
    location?: string;
    plan?: "Pro" | "Free";
  };
  avatarFallback: string;
}

export function PublicProfileHeader({
  user,
  avatarFallback,
}: PublicProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-2 pb-2">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="text-2xl font-semibold">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-2xl font-bold tracking-tight">{user.name}</span>
        {user.location && (
          <span className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            {user.location}
          </span>
        )}
        {user.bio && (
          <p className="text-muted-foreground mt-0.5 max-w-xs text-sm leading-relaxed">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}
