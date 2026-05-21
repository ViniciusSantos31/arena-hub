"use client";

import { getGroupDetails } from "@/actions/group/detail";
import { MatchCard, MatchCardLoading } from "../_components/match-card";
import { MatchEmptyList } from "../_components/match-empty-list";
import { useMatchesFilter } from "../_contexts/matches-filter";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function MatchesPage() {
  const { code } = useParams<{ code: string }>();
  const { data, isLoading, isError } = useMatchesFilter();

  const { data: group } = useQuery({
    queryKey: ["group-details", code],
    enabled: !!code,
    queryFn: () => getGroupDetails({ code }).then((res) => res.data),
  });

  const paidFeature = group?.paidMatchesFeatureEnabled ?? false;

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

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <MatchCardLoading />
        <MatchCardLoading />
        <MatchCardLoading />
      </div>
    );
  }

  if (data?.data?.length === 0) {
    return <MatchEmptyList />;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {data?.data?.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          paidMatchesFeatureEnabled={paidFeature}
        />
      ))}
    </div>
  );
}
