import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Lock } from "lucide-react";

type GroupFeedCardProps = {
  group: {
    name: string;
    description: string;
    isPrivate: boolean;
    lastActivity: string;
    logo: string | null;
  };
};

export const GroupFeedCard = ({ group }: GroupFeedCardProps) => {
  return (
    <Card
      className={cn(
        "dark:bg-background from-transparent to-transparent",
        "hover:bg-accent hover:from-accent/10 transition-colors",
        "cursor-pointer",
        "flex-1",
      )}
    >
      <CardHeader>
        <Avatar className="size-10 rounded-lg">
          <AvatarImage src={group.logo || undefined} />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>{group.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {group.isPrivate && (
          <span className="text-muted-foreground flex items-center text-sm font-medium">
            <Lock className="mr-1 mb-0.5 inline-block size-3" />
            Grupo privado
          </span>
        )}
        <span className="text-muted-foreground text-xs">
          Última atividade em: {group.lastActivity}
        </span>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 @xl:flex-row">
        <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
          Entrar no grupo
        </Button>
      </CardFooter>
    </Card>
  );
};
