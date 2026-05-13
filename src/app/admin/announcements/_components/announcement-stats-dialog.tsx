"use client";

import { adminGetAnnouncementStats } from "@/actions/feature-announcements/admin";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3Icon, EyeIcon, UsersIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";

type AnnouncementStatsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: string;
  announcementTitle: string;
};

export function AnnouncementStatsDialog({
  open,
  onOpenChange,
  announcementId,
  announcementTitle,
}: AnnouncementStatsDialogProps) {
  const { execute, result, isPending, isIdle } = useAction(adminGetAnnouncementStats);

  useEffect(() => {
    if (open && announcementId) {
      execute({ announcementId });
    }
  }, [open, announcementId, execute]);

  const stats = result.data;
  const totalViews = stats?.totalViews ?? 0;
  const viewsByGroup = stats?.viewsByGroup ?? [];
  const maxCount =
    viewsByGroup.length > 0
      ? Math.max(...viewsByGroup.map((g) => g.viewCount))
      : 1;

  const isLoading = isPending || (open && isIdle && !stats);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Estatísticas de visualizações"
      description={announcementTitle}
      icon={BarChart3Icon}
      content={
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <EyeIcon className="text-primary size-6" />
            </div>
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-wide">
                Total de visualizações
              </div>
              {isLoading ? (
                <Skeleton className="mt-1 h-8 w-16" />
              ) : (
                <div className="text-3xl font-black">
                  {totalViews.toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">Visualizações por grupo</span>
              {!isLoading && viewsByGroup.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {viewsByGroup.length}{" "}
                  {viewsByGroup.length === 1 ? "grupo" : "grupos"}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : viewsByGroup.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
                Nenhuma visualização registrada ainda
              </div>
            ) : (
              <div className="space-y-3">
                {viewsByGroup.map((group) => {
                  const pct =
                    maxCount > 0 ? (group.viewCount / maxCount) * 100 : 0;
                  return (
                    <div key={group.organizationId} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {group.organizationName}
                          </span>
                          <span className="text-muted-foreground shrink-0 font-mono text-xs">
                            {group.organizationCode}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {group.viewCount.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
