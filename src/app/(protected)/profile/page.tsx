import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { headers } from "next/headers";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return (
    <div className="flex w-full flex-col items-center space-y-3">
      <Avatar
        className={cn(
          "mb-4 h-32 w-32 rounded-lg",
          "ring-offset-background ring-primary relative overflow-visible ring-2 ring-offset-3",
          user?.image
            ? "ring-offset-background ring-2 ring-offset-2"
            : "bg-muted",
        )}
      >
        {user?.image && <AvatarImage src={user.image} alt={user?.name} />}
        <AvatarFallback className="text-2xl">
          {user?.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
        <Badge className="text-background absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 font-bold uppercase">
          Pro
        </Badge>
      </Avatar>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">{user?.name}</span>
        <span className="text-muted-foreground">{user?.email}</span>
      </div>

      <section>
        <div className="border-border flex rounded-full border">
          <Button
            variant="outline"
            className="rounded-none rounded-l-full border-0 border-r"
          >
            340 Seguidores
          </Button>
          <Button
            variant="outline"
            className="rounded-none rounded-r-full border-0"
          >
            219 Seguindo
          </Button>
        </div>
      </section>

      <main className="flex w-full max-w-4xl flex-1 flex-col gap-2 md:flex-row [&>div]:flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Meus grupos</CardTitle>
            <CardDescription>Grupos que você faz parte</CardDescription>
            <CardAction>
              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "!px-0",
                })}
                href="/groups"
              >
                Ver grupos
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <section className="flex items-center space-x-2">
              <div>
                <span className="text-xl">2</span>
                <p className="text-muted-foreground text-xs">Participante</p>
              </div>
              <div>
                <span className="text-xl">5</span>
                <p className="text-muted-foreground text-xs">Proprietário</p>
              </div>
            </section>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Partidas</CardTitle>
            <CardDescription>Partidas que você participou</CardDescription>
            <CardAction>
              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "!px-0",
                })}
                href="/groups"
              >
                Ver partidas
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <section className="flex items-center space-x-2">
              <div>
                <span className="text-xl">7</span>
                <p className="text-muted-foreground text-xs">Participante</p>
              </div>
              <div>
                <span className="text-xl">5</span>
                <p className="text-muted-foreground text-xs">Criador</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
