import { MatchCard } from "./_components/match-card";

export default function MatchesPage() {
  return (
    <div className="flex flex-col gap-4">
      <MatchCard />
      <MatchCard />
      <MatchCard />
      <MatchCard />
    </div>
  );
}
