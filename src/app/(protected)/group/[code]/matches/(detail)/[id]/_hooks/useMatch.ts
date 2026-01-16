import { matchDetails } from "@/actions/match/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const useMatch = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  return useQuery({
    queryKey: ["match", id],
    enabled: !!id,
    queryFn: async () => matchDetails({ matchId: id }).then((res) => res.data),
    placeholderData: keepPreviousData,
  });
};
