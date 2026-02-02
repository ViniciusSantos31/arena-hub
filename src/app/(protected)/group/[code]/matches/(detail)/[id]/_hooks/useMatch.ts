import { useParams } from "next/navigation";
import { useMatchDetails } from "./use-match-data";

export const useMatch = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  return useMatchDetails(id);
};
