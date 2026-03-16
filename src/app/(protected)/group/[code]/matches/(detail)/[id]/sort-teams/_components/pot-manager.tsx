"use client";

import { listMatchPlayers } from "@/actions/match/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, GripVertical, PlusIcon, Trash2Icon } from "lucide-react";
import { Pot } from "../types";

const POT_COLORS: Pot["color"][] = ["purple", "teal", "coral", "amber"];

const POT_STYLES: Record<
  Pot["color"],
  { header: string; badge: string; border: string }
> = {
  purple: {
    header: "bg-[#EEEDFE] dark:bg-[#26215C]",
    badge: "bg-[#EEEDFE] text-[#3C3489] dark:bg-[#26215C] dark:text-[#CECBF6]",
    border: "border-[#534AB7]",
  },
  teal: {
    header: "bg-[#E1F5EE] dark:bg-[#04342C]",
    badge: "bg-[#E1F5EE] text-[#085041] dark:bg-[#04342C] dark:text-[#9FE1CB]",
    border: "border-[#0F6E56]",
  },
  coral: {
    header: "bg-[#FAECE7] dark:bg-[#4A1B0C]",
    badge: "bg-[#FAECE7] text-[#712B13] dark:bg-[#4A1B0C] dark:text-[#F5C4B3]",
    border: "border-[#993C1D]",
  },
  amber: {
    header: "bg-[#FAEEDA] dark:bg-[#412402]",
    badge: "bg-[#FAEEDA] text-[#633806] dark:bg-[#412402] dark:text-[#FAC775]",
    border: "border-[#854F0B]",
  },
};

type PotManagerProps = {
  matchId: string;
  pots: Pot[];
  onChange: (pots: Pot[]) => void;
  nTeams: number;
};

export const PotManager = ({ matchId, pots, onChange }: PotManagerProps) => {
  const { data: playersData, isLoading } = useQuery({
    queryKey: ["match-players-pot", matchId],
    queryFn: async () => listMatchPlayers({ matchId }).then((res) => res.data),
  });

  const allPlayers = [
    ...(playersData?.players ?? []),
    ...(playersData?.waitingQueue ?? []),
  ].filter((p) => p.confirmed);

  // IDs já alocados em algum pote
  const assignedIds = new Set(pots.flatMap((p) => p.playerIds));
  const unassigned = allPlayers.filter((p) => !assignedIds.has(p.id));

  const addPot = () => {
    if (pots.length >= 4) return;
    const nextColor = POT_COLORS[pots.length % POT_COLORS.length];
    onChange([
      ...pots,
      {
        id: crypto.randomUUID(),
        label: `Pote ${pots.length + 1}`,
        color: nextColor,
        playerIds: [],
      },
    ]);
  };

  const removePot = (potId: string) => {
    const filtered = pots.filter((p) => p.id !== potId);
    const renumbered = filtered.map((pot, index) => ({
      ...pot,
      label: `Pote ${index + 1}`,
      color: POT_COLORS[index % POT_COLORS.length],
    }));
    onChange(renumbered);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newPots = pots.map((pot) => ({
      ...pot,
      playerIds: [...pot.playerIds],
    }));

    // Remove da origem
    if (source.droppableId !== "unassigned") {
      const src = newPots.find((p) => p.id === source.droppableId);
      if (src) src.playerIds.splice(source.index, 1);
    }

    // Adiciona no destino
    if (destination.droppableId !== "unassigned") {
      const dest = newPots.find((p) => p.id === destination.droppableId);
      if (dest) dest.playerIds.splice(destination.index, 0, draggableId);
    }

    onChange(newPots);
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <span className="text-muted-foreground text-sm">
          Carregando jogadores...
        </span>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-4">
        {/* Regra explicativa */}
        <div className="bg-primary/5 border-primary rounded-xl border p-3 text-sm">
          <p className="text-primary font-medium">
            🎩 Como funciona o sorteio por potes?
          </p>
          <p className="text-muted-foreground mt-1">
            Cada time receberá <strong>1 jogador de cada pote</strong> no
            sorteio. Arraste os jogadores para os potes antes de sortear.
            Jogadores sem pote ficam como reservas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @xl:grid-cols-3">
          {/* Potes existentes */}
          {pots.map((pot) => {
            const style = POT_STYLES[pot.color];
            const potPlayers = pot.playerIds
              .map((id) => allPlayers.find((p) => p.id === id))
              .filter(Boolean);

            return (
              <Droppable key={pot.id} droppableId={pot.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-xl border-2 transition-colors",
                      style.border,
                      snapshot.isDraggingOver &&
                        "ring-primary ring-2 ring-offset-1",
                    )}
                  >
                    {/* Header do pote */}
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-2",
                        style.header,
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎩</span>
                        <span className="font-mono text-sm font-bold">
                          {pot.label}
                        </span>
                        <Badge className={cn("text-xs", style.badge)}>
                          {potPlayers.length} jogador
                          {potPlayers.length !== 1 && "es"}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePot(pot.id)}
                        className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>

                    {/* Lista de jogadores do pote */}
                    <div className="bg-card flex min-h-[120px] flex-col gap-2 p-2">
                      {potPlayers.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex h-full flex-1 items-center justify-center py-4">
                          <span className="text-muted-foreground text-xs">
                            Arraste jogadores aqui
                          </span>
                        </div>
                      )}
                      {potPlayers.map((player, index) => (
                        <Draggable
                          key={player!.id}
                          draggableId={player!.id}
                          index={index}
                        >
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={cn(
                                "bg-background flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm",
                                snap.isDragging && "opacity-90 shadow-md",
                              )}
                            >
                              <span {...prov.dragHandleProps}>
                                <GripVertical className="text-muted-foreground size-4" />
                              </span>
                              <Avatar className="size-6">
                                <AvatarImage src={player!.image ?? undefined} />
                                <AvatarFallback className="text-xs">
                                  {getAvatarFallback(player!.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="flex-1 truncate">
                                {player!.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {player!.score} pts
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}

          {/* Botão adicionar pote */}
          {pots.length < 4 && (
            <button
              type="button"
              onClick={addPot}
              className="border-border text-muted-foreground hover:border-primary hover:text-primary flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
            >
              <PlusIcon className="size-8" />
              <span className="text-sm font-medium">Adicionar pote</span>
              <span className="text-xs">máx. 4 potes</span>
            </button>
          )}
        </div>

        {/* Pool de jogadores sem pote */}
        <Droppable droppableId="unassigned">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "rounded-xl border-2 border-dashed p-3 transition-colors",
                snapshot.isDraggingOver
                  ? "border-primary bg-primary/5"
                  : "border-border",
              )}
            >
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                👤 Sem pote ({unassigned.length}) — serão reservas
              </p>
              <div className="flex flex-wrap gap-2">
                {unassigned.map((player, index) => (
                  <Draggable
                    key={player.id}
                    draggableId={player.id}
                    index={index}
                  >
                    {(prov, snap) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className={cn(
                          "bg-card flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs",
                          snap.isDragging && "shadow-md",
                        )}
                      >
                        <GripVertical className="text-muted-foreground size-3" />
                        <Avatar className="size-5">
                          <AvatarImage src={player.image ?? undefined} />
                          <AvatarFallback className="text-[9px]">
                            {getAvatarFallback(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{player.name}</span>
                        <span className="text-muted-foreground ml-auto">
                          {player.score} pts
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {unassigned.length === 0 && !snapshot.isDraggingOver && (
                  <span className="text-muted-foreground text-xs">
                    Todos os jogadores estão em potes{" "}
                    <CheckIcon className="inline size-3" />
                  </span>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};
