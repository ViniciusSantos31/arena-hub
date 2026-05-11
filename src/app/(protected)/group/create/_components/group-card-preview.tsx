"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { LockIcon, UsersIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
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
  const { name, description, maxPlayers } = methods.watch();
  const previewName = name || "Nome do grupo";
  const previewDescription = description || "Descrição do grupo";
  const previewImage = image ? URL.createObjectURL(image) : null;

  return (
    <div
      className={cn(
        "flex max-h-full w-full flex-1 gap-0 sm:space-x-3 lg:h-full lg:flex-col lg:space-y-3",
        className,
      )}
    >
      <Card className="from-card/50 to-background hidden h-full w-full flex-1 border-0 bg-transparent bg-linear-to-l lg:flex lg:bg-linear-to-t" />
      <Card className="border-border/60 w-full shrink-0 overflow-hidden">
        <CardHeader className="gap-3 pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="size-11 rounded-xl">
              {previewImage && (
                <AvatarImage src={previewImage} className="object-cover" />
              )}
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                {getAvatarFallback(previewName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold">{previewName}</p>
                <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                  <LockIcon className="h-3 w-3" />
                  Privado
                </Badge>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <UsersIcon className="h-3 w-3" />
                Até {maxPlayers ?? 10} jogadores
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {previewDescription}
          </p>
        </CardContent>
      </Card>
      <Card className="from-card/50 to-background hidden h-full flex-1 border-0 bg-transparent bg-linear-to-r sm:flex lg:bg-linear-to-b" />
    </div>
  );
};
