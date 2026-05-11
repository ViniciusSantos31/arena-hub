import { listLfgPlayers } from "@/actions/user/list-lfg-players";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";
import { DiscoverClient } from "./_components/discover-client";
import { DiscoverEmptyList } from "./_components/empty-list";

export default async function DiscoverPage() {
  const result = await listLfgPlayers();
  const players = result?.data ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Vitrine de jogadores" />
      </PageHeader>
      <PageContent>
        {players.length === 0 ? (
          <DiscoverEmptyList />
        ) : (
          <DiscoverClient players={players} />
        )}
      </PageContent>
    </PageContainer>
  );
}
