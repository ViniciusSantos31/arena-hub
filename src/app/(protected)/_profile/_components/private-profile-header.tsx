import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { getAvatarFallback } from "@/utils/avatar";
import {
  CameraIcon,
  ExternalLinkIcon,
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
}

const stats = [
  { label: "Partidas", value: 42, icon: SwordsIcon },
  { label: "Grupos", value: 7, icon: UsersIcon },
];

export function PrivateProfileHeader({ user, bio }: PrivateProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="group relative cursor-pointer">
        <Avatar className="h-28 w-28">
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
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <CameraIcon className="h-7 w-7 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-2xl font-bold tracking-tight">
          {user?.name ?? "Jogador"}
        </span>
        <span className="text-muted-foreground text-sm">{user?.email}</span>
        {bio && (
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">{bio}</p>
        )}
      </div>

      <Link
        href={`/profile/${user?.id ?? ""}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <ExternalLinkIcon className="h-4 w-4" />
        Ver perfil público
      </Link>

      <div className="grid w-full max-w-xs grid-cols-2 divide-x overflow-hidden rounded-xl border">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="relative flex flex-col items-center justify-center gap-1 overflow-hidden py-3 text-center"
          >
            <Icon className="text-muted absolute top-0 left-4 size-full -translate-x-1/2 opacity-100 dark:opacity-40" />
            <span className="text-xl font-bold">{value}</span>
            <span className="text-muted-foreground text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
