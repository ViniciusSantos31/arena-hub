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
    <main className="relative flex h-fit w-full flex-col gap-4">
      <div className="sticky top-8 z-10 flex w-full items-center justify-center">
        <SearchInput />
      </div>
      <section className="grid w-full grid-cols-1 gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
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
      <footer className="flex h-12 w-full flex-col items-center justify-center">
        <span className="text-muted-foreground text-xs">
          Todos os grupos disponíveis
        </span>
      </footer>
    </main>
  );
}
