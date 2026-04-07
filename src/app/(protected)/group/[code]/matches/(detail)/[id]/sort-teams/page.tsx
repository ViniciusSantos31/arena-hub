"use client";

import { Player, Team } from "@/actions/team/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShuffleIcon,
} from "lucide-react";
import { use, useState } from "react";
import { DroppableTeamsList } from "./_components/droppable-teams-list";
import { EmptyTeamList } from "./_components/empty-team-list";
import { ModeSelector } from "./_components/mode-selector";
import { PotManager } from "./_components/pot-manager";
import { SaveTeamsConfigButton } from "./_components/save-teams-config-button";
import { useSortTeams } from "./_hooks";
import type { Pot, SortMode } from "./types";

const STEP_LABELS = ["modo", "configurações", "potes", "resultado"];

function StepIndicator({
  current,
  showPots,
}: {
  current: number;
  showPots: boolean;
}) {
  const labels = showPots
    ? STEP_LABELS
    : STEP_LABELS.filter((l) => l !== "potes");
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                  ? "border-primary text-primary border-2"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i < current ? <CheckIcon size={12} /> : i + 1}
          </div>
          <span
            className={cn(
              "hidden text-xs capitalize @sm:block",
              i === current
                ? "text-foreground font-medium"
                : "text-muted-foreground",
            )}
          >
            {label}
          </span>
          {i < labels.length - 1 && (
            <div className="bg-border h-px w-4 @sm:w-8" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SortTeamsPage({
  params,
}: {
  params: Promise<{ code: string; id: string }>;
}) {
  const { code, id: matchId } = use(params);

  const [mode, setMode] = useState<SortMode>("balanced");
  const [nTeams, setNTeams] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [reserves, setReserves] = useState<Player[]>([]);
  const [pots, setPots] = useState<Pot[]>([
    {
      id: crypto.randomUUID(),
      label: "Pote 1",
      color: "purple",
      playerIds: [],
    },
    { id: crypto.randomUUID(), label: "Pote 2", color: "teal", playerIds: [] },
  ]);
  const [step, setStep] = useState(0);

  const isPots = mode === "pots";

  const { mutate, isPending } = useSortTeams({
    onSuccess: (data) => {
      setTeams(data?.teams ?? []);
      setReserves(data?.reserves ?? []);
      setStep(isPots ? 3 : 2);
    },
  });

  const handleSort = () => {
    mutate({ matchId, organizationCode: code, nTeams, mode, pots });
  };

  const playersPerTeam =
    teams.reduce((acc, t) => acc + t.players.length, 0) / Math.max(nTeams, 1);

  const canSave =
    teams.length > 0 &&
    reserves.length === 0 &&
    teams.every(
      (t) => t.players.length > 0,
    );

  return (
    <div className="@container flex flex-col gap-6">
      {/* Header com indicador de passos */}
      <div className="flex flex-col gap-3">
        <div className="mb-2">
          <h1 className="font-mono text-lg font-bold">Sorteio de times</h1>
          <p className="text-muted-foreground text-sm">
            Escolha o modo e configure o sorteio
          </p>
        </div>
        <StepIndicator current={step} showPots={isPots} />
      </div>

      {/* Passo 1: Modo */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Como quer sortear?</CardTitle>
            <CardDescription>
              Escolha a forma de distribuir os jogadores nos times.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ModeSelector value={mode} onChange={setMode} />
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)}>
                Próximo <ChevronRightIcon />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passo 2: Configurações */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>
              Defina quantos times serão formados
              {isPots && " e quantos potes existirão"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="n-teams">Quantidade de times</Label>
                <Input
                  id="n-teams"
                  type="number"
                  min={2}
                  max={20}
                  value={nTeams}
                  onChange={(e) => setNTeams(Number(e.target.value))}
                />
                <p className="text-muted-foreground text-xs">
                  Mínimo 2, máximo 20 times
                </p>
              </div>
            </div>

            {isPots && (
              <div className="bg-primary/5 border-primary rounded-xl border p-3 text-sm">
                <p className="text-primary font-medium">💡 Dica sobre potes</p>
                <p className="mt-1">
                  Cada time receberá <strong>1 jogador de cada pote</strong>.
                  Por isso, o número de potes × times não pode ultrapassar o
                  total de jogadores confirmados. Você poderá adicionar e
                  remover potes na próxima etapa.
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeftIcon />
                Voltar
              </Button>
              <Button
                onClick={() => {
                  if (isPots) {
                    setStep(2);
                  } else {
                    handleSort();
                  }
                }}
                disabled={isPending}
              >
                {isPots
                  ? "Próximo"
                  : isPending
                    ? "Sorteando..."
                    : "Sortear agora"}
                {!isPots && <ShuffleIcon />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passo 3 (só potes): Gerenciar potes */}
      {step === 2 && isPots && (
        <Card>
          <CardHeader>
            <CardTitle>Monte os potes</CardTitle>
            <CardDescription>
              Arraste os jogadores para os potes. Cada time receberá 1 de cada
              pote.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <PotManager
              matchId={matchId}
              pots={pots}
              onChange={setPots}
              nTeams={nTeams}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeftIcon />
                Voltar
              </Button>
              <Button
                onClick={handleSort}
                disabled={
                  isPending || pots.some((p) => p.playerIds.length === 0)
                }
              >
                {isPending ? "Sorteando..." : "Sortear"}
                <ShuffleIcon />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passo final: Resultado */}
      {((isPots && step === 3) || (!isPots && step === 2)) && (
        <>
          {teams.length === 0 ? (
            <EmptyTeamList />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 @lg:flex-row @lg:items-start @lg:justify-between">
                  <div>
                    <CardTitle>Resultado do sorteio</CardTitle>
                    <CardDescription>
                      Arraste os jogadores entre os times para ajustar. Quando
                      estiver satisfeito, salve.
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 @lg:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTeams([]);
                        setReserves([]);
                        setStep(isPots ? 2 : 1);
                      }}
                    >
                      <ShuffleIcon className="size-4" />
                      Sortear novamente
                    </Button>
                    <SaveTeamsConfigButton
                      matchId={matchId}
                      teams={teams}
                      reserves={reserves}
                      canSaveConfiguration={canSave}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isPots && (
                  <div className="bg-primary/5 border-primary mb-4 rounded-xl border p-3 text-sm">
                    <p className="text-primary font-medium">
                      🎩 Sorteio por potes aplicado
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Cada time recebeu <strong>1 jogador de cada pote</strong>.
                      Arraste para ajustar se necessário.
                    </p>
                  </div>
                )}
                {teams.some((t) => t.players.length === 0) && (
                  <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-700 dark:bg-yellow-800/5">
                    <p className="dark:text-foreground font-medium text-yellow-800">
                      ⚠️ Times desequilibrados
                    </p>
                    <p className="mt-0.5 text-yellow-700 dark:text-yellow-300">
                      Pelo menos um time ficou sem jogadores. Arraste os
                      jogadores para equilibrar os times antes de salvar.
                    </p>
                  </div>
                )}
                <DroppableTeamsList
                  teams={teams}
                  setTeams={setTeams}
                  reserves={reserves}
                  setReserves={setReserves}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
