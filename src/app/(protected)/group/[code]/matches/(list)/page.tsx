"use client";

import { listMatches } from "@/actions/match/list";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { MatchCard, MatchCardLoading } from "../_components/match-card";

export default function MatchesPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["matches", code],
    enabled: !!code,
    queryFn: () =>
      listMatches({
        code,
      }),
  });

  if (isError) {
    return (
      <div className="mx-auto my-auto flex h-full flex-col items-center justify-center gap-2">
        <h2 className="text-2xl font-semibold">
          Ocorreu um erro ao carregar as partidas.
        </h2>
        <span className="text-muted-foreground">
          Tente novamente mais tarde.
        </span>
      </div>
    );
  }

  if (!isLoading && data?.data?.length === 0) {
    return (
      <div className="mx-auto my-auto flex h-full flex-col items-center justify-center gap-2">
        <h2 className="text-2xl font-semibold">Nenhuma partida encontrada.</h2>
        <span className="text-muted-foreground">
          Crie uma nova partida para começar a jogar!
        </span>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <MatchCardLoading />
        <MatchCardLoading />
        <MatchCardLoading />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data?.data?.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
