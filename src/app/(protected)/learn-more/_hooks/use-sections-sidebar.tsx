"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface SectionsSidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SectionsSidebarContext = createContext<
  SectionsSidebarContextType | undefined
>(undefined);

interface SectionsSidebarProviderProps {
  children: ReactNode;
}

export function SectionsSidebarProvider({
  children,
}: SectionsSidebarProviderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <SectionsSidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </SectionsSidebarContext.Provider>
  );
}

export function useSectionsSidebar() {
  const context = useContext(SectionsSidebarContext);
  if (context === undefined) {
    throw new Error(
      "useSectionsSidebar must be used within a SectionsSidebarProvider",
    );
  }
  return context;
}
