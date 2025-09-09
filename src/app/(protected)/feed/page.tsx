import { GroupFeedCard } from "./_components/group-feed-card";
import { SearchInput } from "./_components/search-input";

export default function FeedPage() {
  return (
    <main className="relative flex h-fit w-full flex-col">
      <div className="bg-background/50 sticky top-0 z-10 flex h-fit w-full items-center justify-center p-3 backdrop-blur-md">
        <SearchInput />
      </div>
      <section className="mt-3 grid w-full grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
        <GroupFeedCard />
      </section>
    </main>
  );
}
