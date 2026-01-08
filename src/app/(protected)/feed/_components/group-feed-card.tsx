import { joinGroup } from "@/actions/group/join";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { EyeIcon, Lock } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type GroupFeedCardProps =
  | {
      preview?: false;
      group: {
        code: string;
        name: string;
        isMember?: boolean;
        description: string;
        isPrivate?: boolean;
        createdAt?: string;
        logo: string | null;
      };
    }
  | {
      preview?: true;
      group: {
        name: string;
        description: string;
        isPrivate: boolean;
        logo: string | null;
        createdAt?: string;
        code?: string;
        isMember?: string;
      };
    };

const JoinGroupButton = ({
  code,
  isPrivate,
}: {
  code?: string;
  isPrivate?: boolean;
}) => {
  const router = useRouter();
  const joinGroupAction = useAction(joinGroup, {
    onSuccess: () => {
      toast.success("Você entrou no grupo com sucesso!", {
        id: "join-group-toast",
      });
      router.push("/group/" + code + "/members");
    },
    onError: () => {
      toast.error("Erro ao entrar no grupo. Tente novamente.", {
        id: "join-group-toast",
      });
    },
  });

  const handleJoinGroup = async () => {
    if (!code) return;

    toast.promise(joinGroupAction.executeAsync({ code }), {
      loading: "Entrando no grupo...",
      error: "Erro ao entrar no grupo. Tente novamente.",
      success: "Você entrou no grupo com sucesso!",
      id: "join-group-toast",
    });
  };

  if (isPrivate) {
    return (
      <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
        <Lock />
        Solicitar acesso
      </Button>
    );
  }

  return (
    <Button
      variant={"outline"}
      className="w-full @xl:ml-auto @xl:w-fit"
      onClick={handleJoinGroup}
      disabled={joinGroupAction.isExecuting}
    >
      {joinGroupAction.isExecuting ? "Entrando..." : "Entrar no grupo"}
    </Button>
  );
};

const ViewGroupButton = ({ code }: { code?: string }) => {
  const router = useRouter();

  return (
    <Button
      variant={"outline"}
      className="w-full @xl:ml-auto @xl:w-fit"
      onClick={() => router.push("/group/" + code)}
    >
      <EyeIcon />
      Ver grupo
    </Button>
  );
};

const JoinButtonPreview = ({ isPrivate }: { isPrivate?: boolean }) => {
  if (isPrivate) {
    return (
      <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
        <Lock />
        Solicitar acesso
      </Button>
    );
  }

  return (
    <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
      Entrar no grupo
    </Button>
  );
};

export const GroupFeedCard = ({
  group,
  preview = false,
}: GroupFeedCardProps) => {
  return (
    <Card
      className={cn(
        "dark:bg-background from-transparent to-transparent",
        "hover:bg-accent hover:from-accent/10 transition-colors",
        "cursor-pointer",
        "relative h-full w-full flex-1",
      )}
    >
      {preview && (
        <Badge variant={"secondary"} className="absolute top-2 right-2">
          Prévia
        </Badge>
      )}
      <CardHeader>
        <Avatar className="size-10 rounded-lg">
          <AvatarImage src={group.logo || undefined} className="object-cover" />
          <AvatarFallback>{getAvatarFallback(group.name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="min-h-4 leading-3">{group.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex min-h-5 flex-row items-center justify-between">
        <span className="text-muted-foreground text-xs">
          Criado em:{" "}
          {preview
            ? new Date().toLocaleDateString("pt-BR")
            : group.createdAt
              ? new Date(group.createdAt).toLocaleDateString("pt-BR")
              : "N/A"}
        </span>
        {group.isPrivate && (
          <span className="text-muted-foreground flex items-center text-sm font-medium">
            <Lock className="mr-1 mb-0.5 inline-block size-3" />
            Grupo privado
          </span>
        )}
      </CardContent>
      {preview ? (
        <CardFooter className="mt-auto flex flex-col gap-2 @xl:flex-row">
          <JoinButtonPreview isPrivate={group.isPrivate} />
        </CardFooter>
      ) : (
        <CardFooter className="mt-auto flex flex-col gap-2 @xl:flex-row">
          {group.isMember ? (
            <ViewGroupButton code={group.code} />
          ) : (
            <JoinGroupButton code={group.code} isPrivate={group.isPrivate} />
          )}
        </CardFooter>
      )}
    </Card>
  );
};
