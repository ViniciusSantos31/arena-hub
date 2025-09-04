import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRightIcon,
  Gamepad2Icon,
  MedalIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";

export default function GroupDashboardPage() {
  return (
    <main className="grid w-full gap-4 @2xl:grid-cols-2">
      <Card className="h-fit">
        <CardHeader className="flex w-full items-center justify-between">
          <CardTitle>
            <Gamepad2Icon />
            Partidas realizadas
          </CardTitle>
          <CardAction className="hidden md:flex">
            <Button variant={"link"} size={"sm"} asChild>
              <Link href={"#"}>
                Criar partida
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-wrap gap-5">
            <div className="flex flex-col">
              <span className="text-card-foreground">49</span>
              <span className="text-muted-foreground text-sm">no total</span>
            </div>
            <div className="flex flex-col">
              <span className="text-card-foreground">23</span>
              <span className="text-muted-foreground text-sm">
                no último mês
              </span>
            </div>
          </div>
          {/* <Separator className="my-5" /> */}
          {/* <Card>
            <CardHeader>
              <CardTitle>
                <CalendarClock />
                Próxima partida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <span className="text-card-foreground">Próxima partida</span>
                <span className="text-muted-foreground text-sm">Em breve</span>
              </div>
            </CardContent>
          </Card> */}
        </CardContent>
        <CardFooter className="md:hidden">
          <Button variant={"outline"} size={"sm"} asChild className="ml-auto">
            <Link href={"#"}>
              Criar partida
              <ArrowRightIcon />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <section className="flex w-full flex-1 flex-wrap gap-4">
        <Card className="h-fit w-full">
          <CardHeader className="flex w-full items-center justify-between">
            <CardTitle>
              <Users2Icon />
              Membros
            </CardTitle>
            <CardAction className="hidden md:flex">
              <Button variant={"link"} size={"sm"} asChild>
                <Link href={"#"}>
                  Ver membros
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex w-full flex-wrap gap-5">
              <div className="flex flex-col">
                <span className="text-card-foreground">49</span>
                <span className="text-muted-foreground text-sm">no total</span>
              </div>
              <div className="flex flex-col">
                <span className="text-card-foreground">12</span>
                <span className="text-muted-foreground text-sm">
                  Convidados
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="md:hidden">
            <Button variant={"outline"} size={"sm"} asChild className="ml-auto">
              <Link href={"#"}>
                Ver membros
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex w-full items-center justify-between">
            <CardTitle>
              <MedalIcon />
              Classificações
            </CardTitle>
            <CardAction className="hidden md:flex">
              <Button variant={"link"} size={"sm"} asChild>
                <Link href={"#"}>
                  Ver classificações
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="[&>li]:border-b-border [&>li]:pt-2 [&>li]:not-first:border-t">
              <li className="mb-2 flex justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>RV</AvatarFallback>
                  </Avatar>
                  <span className="text-card-foreground font-bold">
                    Raissa Vieira
                  </span>
                </div>
                <span className="text-muted-foreground">#1</span>
              </li>
              <li className="mb-2 flex justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>VS</AvatarFallback>
                  </Avatar>
                  <span className="text-card-foreground font-bold">
                    Vinicius Santos
                  </span>
                </div>
                <span className="text-muted-foreground">#2</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="md:hidden">
            <Button variant={"outline"} size={"sm"} asChild className="ml-auto">
              <Link href={"#"}>
                Ver classificações
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
