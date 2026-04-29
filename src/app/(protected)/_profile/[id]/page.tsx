"use client";

import { Button } from "@/components/ui/button";
import { getAvatarFallback } from "@/utils/avatar";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { PublicProfileHeader } from "./_components/public-profile-header";
import { PublicProfileStats } from "./_components/public-profile-stats";

const mockPublicUser = {
  id: "mock-user-id",
  name: "Carlos Silva",
  image: null,
  bio: "Goleiro amador apaixonado por futebol. Jogo toda semana com os amigos.",
  location: "São Paulo, SP",
  plan: "Pro" as const,
};

const mockStats = {
  matches: 89,
  groups: 5,
};

const mockCommonGroups = [
  {
    id: "1",
    name: "Arena FC",
    role: "Membro",
    code: "AP4YCY",
    memberCount: 18,
  },
  {
    id: "2",
    name: "Pelada do Bairro",
    role: "Membro",
    code: "XY9ZAB",
    memberCount: 12,
  },
];

const mockRecentMatches = [
  {
    id: "1",
    group: "Arena FC",
    date: "28 Mar 2026",
    confirmed: true,
  },
  {
    id: "2",
    group: "Pelada do Bairro",
    date: "22 Mar 2026",
    confirmed: true,
  },
  {
    id: "3",
    group: "Arena FC",
    date: "15 Mar 2026",
    confirmed: false,
  },
  {
    id: "4",
    group: "Liga Amigos",
    date: "08 Mar 2026",
    confirmed: true,
  },
];

export default function PublicProfilePage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-5">
      <Button variant="ghost" size="icon" onClick={handleGoBack}>
        <ChevronLeftIcon />
      </Button>
      <PublicProfileHeader
        user={mockPublicUser}
        avatarFallback={getAvatarFallback(mockPublicUser.name)}
      />
      <PublicProfileStats
        stats={mockStats}
        commonGroups={mockCommonGroups}
        recentMatches={mockRecentMatches}
      />
    </div>
  );
}
