"use client";

import { Button } from "@/components/ui/button";
import { ComponentProps, PropsWithChildren } from "react";
import { useSectionsSidebar } from "./use-sections-sidebar";

export const ToggleSectionsSidebar = (
  props: PropsWithChildren<Omit<ComponentProps<typeof Button>, "onClick">>,
) => {
  const { setIsOpen, isOpen } = useSectionsSidebar();

  return (
    <Button
      variant="outline"
      className="md:hidden"
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    ></Button>
  );
};
