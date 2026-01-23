import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/utils/avatar";

type AvatarStackProps = {
  users?: (
    | {
        id: string;
        name: string;
        image: string | null;
      }
    | undefined
  )[];
};

export const AvatarStack = ({ users }: AvatarStackProps) => {
  const MAX_AVATARS = 3;
  const avatarsToShow = users?.slice(0, MAX_AVATARS) || [];
  const extraAvatarsCount = (users?.length || 0) - MAX_AVATARS;

  if (avatarsToShow.length === 0) {
    return null;
  }

  return (
    <div className="flex -space-x-2">
      {avatarsToShow.map(
        (user) =>
          user && (
            <Avatar key={user.id} className="ring-card ring-4">
              {user.image && (
                <AvatarImage
                  src={user.image}
                  alt={user.name || "Avatar"}
                  className="inline-block h-8 w-8 rounded-full object-cover"
                />
              )}
              <AvatarFallback>{getAvatarFallback(user.name)}</AvatarFallback>
            </Avatar>
          ),
      )}

      {extraAvatarsCount > 0 && (
        <div
          data-slot="avatar-image"
          className="ring-card bg-muted z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ring-4"
        >
          +{extraAvatarsCount}
        </div>
      )}
    </div>
  );
};
