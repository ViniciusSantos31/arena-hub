"use client";

import { LoadingPage } from "@/components/loading-page";
import { notFound } from "next/navigation";
import { GroupFeedCard } from "./_components/group-feed-card";
import { SearchInput } from "./_components/search-input";
import { useFeedGroups } from "./_hooks";

export default function FeedPage() {
  const { data, isLoading } = useFeedGroups();

  if (!data || isLoading) {
    return <LoadingPage />;
  }

  if (!data.length) {
    return notFound();
  }

  return (
    <main className="relative flex h-fit w-full flex-col">
      <div className="from-background via-background/50 to-background/10 sticky top-0 z-10 flex h-fit w-full items-center justify-center bg-linear-to-b p-3">
        <SearchInput />
      </div>
      <section className="mt-3 grid w-full grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {data.map((group) => (
          <GroupFeedCard
            key={group.id}
            group={{
              ...group,
              description: group.description || "Sem descrição",
              createdAt: group.createdAt.toLocaleDateString(),
            }}
          />
        ))}
      </section>
      <footer className="mt-2 flex h-16 w-full flex-col items-center justify-center space-x-2">
        <span className="text-muted-foreground text-sm">
          Isso é tudo por enquanto! Mais grupos em breve.
        </span>
      </footer>
    </main>
  );
}
