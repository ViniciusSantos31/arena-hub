"use client";

import { createContext, useContext } from "react";

type MatchesPlanContextValue = {
  ownerCanCreateMatch: boolean;
};

const MatchesPlanContext = createContext<MatchesPlanContextValue>({
  ownerCanCreateMatch: true,
});

export function MatchesPlanProvider({
  ownerCanCreateMatch,
  children,
}: {
  ownerCanCreateMatch: boolean;
  children: React.ReactNode;
}) {
  return (
    <MatchesPlanContext.Provider value={{ ownerCanCreateMatch }}>
      {children}
    </MatchesPlanContext.Provider>
  );
}

export function useMatchesPlan() {
  return useContext(MatchesPlanContext);
}
