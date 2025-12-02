"use client";

import { LoadingAnimation } from "@/components/loading-animation";

export default function LoadingFeedPage() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <LoadingAnimation />
      Carregando grupos...
    </main>
  );
}
