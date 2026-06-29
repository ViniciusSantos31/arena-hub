"use client";

import { createContext, useContext } from "react";

type CreateGroupPlanContextValue = {
  maxPlayersLimit: number | null;
};

const CreateGroupPlanContext = createContext<CreateGroupPlanContextValue>({
  maxPlayersLimit: null,
});

export function CreateGroupPlanProvider({
  maxPlayersLimit,
  children,
}: {
  maxPlayersLimit: number | null;
  children: React.ReactNode;
}) {
  return (
    <CreateGroupPlanContext.Provider value={{ maxPlayersLimit }}>
      {children}
    </CreateGroupPlanContext.Provider>
  );
}

export function useCreateGroupPlan() {
  return useContext(CreateGroupPlanContext);
}
