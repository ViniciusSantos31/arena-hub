import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export const GroupFeedCard = () => {
  return (
    <Card
      className={cn(
        "dark:bg-background from-transparent to-transparent",
        "hover:bg-accent hover:from-accent transition-colors",
        "cursor-pointer",
        "flex-1",
      )}
    >
      <CardHeader>
        <Avatar className="size-10 rounded-none">
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <CardTitle>Nome do grupo</CardTitle>
        <CardDescription>Descrição breve do grupo.</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-muted-foreground flex items-center text-sm font-medium">
          <Lock className="mr-1 mb-0.5 inline-block size-3" />
          Grupo privado
        </span>
        <span className="text-muted-foreground text-xs">
          Última atividade em: 12/12/2022
        </span>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 @xl:flex-row">
        <Button variant={"outline"} className="w-full @xl:ml-auto @xl:w-fit">
          Entrar no grupo
        </Button>
        {/* <Button variant={"outline"} className="w-full @xl:w-fit">
          Solicitar entrada
        </Button> */}
      </CardFooter>
    </Card>
  );
};
