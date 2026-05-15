"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { MessageCircleIcon, Star } from "lucide-react";

type FeedbackRow = {
  id: string;
  userId: string;
  userNameSnapshot: string;
  userImageSnapshot: string | null;
  rating: number;
  message: string;
  createdAt: string;
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            rating >= i + 1
              ? "fill-primary text-primary"
              : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

export function FeedbackCardsGrid({
  rows,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  disableActions,
}: {
  rows: FeedbackRow[];
  primaryActionLabel: string;
  secondaryActionLabel: string | null;
  onPrimaryAction: (id: string) => void | Promise<void>;
  onSecondaryAction?: (id: string) => void | Promise<void>;
  disableActions?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyMedia variant={"icon"}>
            <MessageCircleIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhum feedback aqui.</EmptyTitle>
          <EmptyDescription>
            Ainda não há feedbacks para revisar.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <Card key={row.id} className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <Avatar className="size-9">
              {row.userImageSnapshot ? (
                <AvatarImage src={row.userImageSnapshot} />
              ) : null}
              <AvatarFallback>
                {(row.userNameSnapshot ?? "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {row.userNameSnapshot}
              </p>
              <div className="mt-1 flex flex-col items-start justify-center gap-2">
                <RatingStars rating={row.rating} />
                <span className="text-muted-foreground text-xs">
                  {dayjs(row.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {row.message}
            </p>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            {secondaryActionLabel && onSecondaryAction ? (
              <Button
                variant="outline"
                onClick={() => onSecondaryAction(row.id)}
                disabled={disableActions}
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
            <Button
              onClick={() => onPrimaryAction(row.id)}
              disabled={disableActions}
            >
              {primaryActionLabel}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
