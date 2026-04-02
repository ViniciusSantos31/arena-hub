import { joinGroup } from "@/actions/group/join";
import { createJoinRequest } from "@/actions/request/create";
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
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { formatDate } from "@/utils/date";
import { EyeIcon, Lock } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UpgradePlanDialog } from "../../_components/upgrade-plan-dialog";
import { useCheckAlreadyRequested } from "../_hooks";

type GroupFeedCardProps =
  | {
      preview?: false;
      group: {
        code: string;
        name: string;
        isMember?: boolean;
        description: string;
        isPrivate?: boolean;
        createdAt: string;
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
        createdAt: string;
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
  const groups = authClient.useListOrganizations();
  const [dialogOpen, setDialogOpen] = useState(false);

  const groupsCount = groups.data?.length ?? 0;

  const { data: alreadyRequested, refetch } = useCheckAlreadyRequested(
    code ?? "",
    isPrivate ?? false,
  );

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

  const createJoinRequestAction = useAction(createJoinRequest, {
    onSuccess() {
      toast.success("Solicitação enviada com sucesso!", {
        id: "join-group-request-toast",
      });
      refetch();
    },
  });

  const handleCreateJoinRequest = () => {
    if (!code) return;

    toast.promise(
      createJoinRequestAction.executeAsync({ organizationCode: code }),
      {
        loading: "Enviando solicitação de acesso...",
        error: "Erro ao enviar solicitação. Tente novamente.",
        success: "Solicitação enviada com sucesso!",
        id: "join-group-request-toast",
      },
    );
  };

  const handleJoinGroup = async () => {
    if (!code) return;

    toast.promise(joinGroupAction.executeAsync({ code }), {
      loading: "Entrando no grupo...",
      error: "Erro ao entrar no grupo. Tente novamente.",
      success: "Você entrou no grupo com sucesso!",
      id: "join-group-toast",
    });
  };

  if (groupsCount >= 2 && isPrivate) {
    return (
      <UpgradePlanDialog
        feature="join_groups"
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      >
        <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
          <Lock />
          Solicitar acesso
        </Button>
      </UpgradePlanDialog>
    );
  } else if (groupsCount >= 2) {
    return (
      <UpgradePlanDialog
        feature="join_groups"
        onOpenChange={setDialogOpen}
        open={dialogOpen}
      >
        <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
          Entrar no grupo
        </Button>
      </UpgradePlanDialog>
    );
  }

  if (isPrivate) {
    return (
      <Button
        variant={"outline"}
        className="w-full @xl:ml-auto @xl:w-fit"
        onClick={handleCreateJoinRequest}
        disabled={createJoinRequestAction.isExecuting || alreadyRequested}
      >
        <Lock />
        {alreadyRequested ? "Solicitação enviada" : "Solicitar acesso"}
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
      <Button
        variant={"outline"}
        type="button"
        className="w-full @xl:ml-auto @xl:w-fit"
      >
        <Lock />
        Solicitar acesso
      </Button>
    );
  }

  return (
    <Button
      variant={"outline"}
      type="button"
      className="w-full @xl:ml-auto @xl:w-fit"
    >
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
        "bg-card border-border/60 hover:border-primary/20 hover:bg-primary/5",
        "relative h-full w-full flex-1 cursor-pointer transition-all duration-200",
      )}
    >
      {preview && (
        <Badge variant={"secondary"} className="absolute top-3 right-3 text-xs">
          Prévia
        </Badge>
      )}
      <CardHeader className="gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-xl">
            <AvatarImage src={group.logo || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm font-semibold">
              {getAvatarFallback(group.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base leading-snug">{group.name}</CardTitle>
            {group.isPrivate && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Lock className="size-3" />
                Grupo privado
              </span>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 whitespace-pre-wrap text-sm">
          {group.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <span className="text-muted-foreground text-xs">
          Criado em {formatDate(group.createdAt)}
        </span>
      </CardContent>
      {preview ? (
        <CardFooter className="pt-0">
          <JoinButtonPreview isPrivate={group.isPrivate} />
        </CardFooter>
      ) : (
        <CardFooter className="pt-0">
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
