"use client";

import { Player, Team } from "@/actions/team/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Users2Icon } from "lucide-react";
import { PlayerItem } from "../../_components/player-item";

export const DroppableTeamsList = ({
  teams,
  reserves,
  setTeams,
  setReserves,
}: {
  teams: Team[];
  reserves: Player[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setReserves: React.Dispatch<React.SetStateAction<Player[]>>;
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Moving between teams
    const startTeamId = source.droppableId;
    const endTeamId = destination.droppableId;

    // Find the player being moved
    let movingPlayer: Player | undefined;

    if (startTeamId === "available-players") {
      movingPlayer = reserves.find((player) => player.id === draggableId);
      if (!movingPlayer) return;
      setReserves((prev) =>
        prev.filter((player) => player.id !== movingPlayer!.id),
      );
    } else {
      const startTeam = teams.find(
        (team) => `team_${team.team}` === startTeamId,
      );
      if (!startTeam) return;
      movingPlayer = startTeam.players.find(
        (player) => player.id === draggableId,
      );
      if (!movingPlayer) return;
      startTeam.players = startTeam.players.filter(
        (player) => player.id !== movingPlayer!.id,
      );
      setTeams([...teams]);
    }

    if (endTeamId === "available-players") {
      setReserves((prev) => {
        const newReserves = Array.from(prev);
        newReserves.splice(destination.index, 0, movingPlayer!);
        return newReserves;
      });
    } else {
      const endTeam = teams.find((team) => `team_${team.team}` === endTeamId);
      if (!endTeam) return;
      endTeam.players.splice(destination.index, 0, movingPlayer!);
      setTeams([...teams]);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {teams.map((team) => (
        <Droppable key={team.team} droppableId={`team_${team.team}`}>
          {(provided) => (
            <Card ref={provided.innerRef} {...provided.droppableProps}>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-3 font-medium">
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                    <Users2Icon className="text-muted-foreground h-5 w-5" />
                  </div>
                  Time {team.team}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {team.players.map((player, index) => (
                  <Draggable
                    key={player.id}
                    draggableId={player.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="mb-1"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <PlayerItem player={player} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </CardContent>
            </Card>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};
