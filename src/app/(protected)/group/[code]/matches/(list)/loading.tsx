import { MatchCardLoading } from "../_components/match-card";

export default function LoadingListMatches() {
  return (
    <div className="space-y-4">
      <MatchCardLoading />
      <MatchCardLoading />
      <MatchCardLoading />
    </div>
  );
}
