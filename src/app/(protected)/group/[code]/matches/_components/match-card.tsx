import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AvatarStack } from "./avatar-stack";

export const MatchCard = () => {
  const MAX_PLAYERS = 20;
  const filledPlayers = 12;
  const progressValue = (filledPlayers * 100) / MAX_PLAYERS;

  return (
    <Link href={"matches/id"} className="group w-full rounded-xl">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Arena Hub FC</CardTitle>
          <CardDescription>
            Futebol 7 • Masculino • Domingo, 25 de Agosto • 10:00 AM
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p>
                {filledPlayers} de {MAX_PLAYERS}
              </p>
              <p className="text-muted-foreground text-sm">vagas preenchidas</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">R$ 20,00</p>
              <p className="text-muted-foreground text-sm">por pessoa</p>
            </div>
          </div>
          <div className="mb-4 w-full">
            <Progress value={progressValue} className="h-1" />
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Local:</p>
              <p className="text-muted-foreground text-sm">
                Arena Hub - Rua Exemplo, 123
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Duração:</p>
              <p className="text-muted-foreground text-sm">1h30min</p>
            </div>
          </div>
          <div className="mt-auto">
            <Label className="mb-4">Participantes:</Label>
            <AvatarStack />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
