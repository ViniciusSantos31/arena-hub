"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { UseFormReturn } from "react-hook-form";
import { GroupFeedCard } from "../../../feed/_components/group-feed-card";
import { CreateGroupFormData } from "../_schema/create";

export const GroupFeedCardPreview = ({
  methods,
  image,
  className,
}: {
  methods: UseFormReturn<CreateGroupFormData>;
  image: File | null;
  className?: string;
}) => {
  const { name, description, isPrivate } = methods.watch();
  return (
    <div
      className={cn(
        "sticky top-0 flex max-h-full w-full flex-1 gap-0 sm:space-x-3 lg:h-full lg:flex-col lg:space-y-3",
        className,
      )}
    >
      <Card className="from-card/50 to-background hidden h-full flex-1 border-0 bg-transparent bg-linear-to-l lg:flex lg:bg-linear-to-t" />
      <GroupFeedCard
        preview
        group={{
          name: name || "Nome do grupo",
          description: description || "Descrição do grupo",
          isPrivate: isPrivate || false,
          createdAt: dayjs().toDate().toISOString(),
          logo: image ? URL.createObjectURL(image) : null,
        }}
      />
      <Card className="from-card/50 to-background hidden h-full flex-1 border-0 bg-transparent bg-linear-to-r sm:flex lg:bg-linear-to-b" />
    </div>
  );
};
