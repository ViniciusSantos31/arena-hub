import { PlusIcon, SearchIcon, ZapIcon } from "lucide-react";
import { GroupButton } from "./_components/group-button";
import { NotificationCard } from "./_components/notification-card";

export default function ProtectedPage() {
  return (
    <div className="bg-background flex w-full flex-col">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Arena Hub</h1>
        <p className="text-muted-foreground text-lg">
          Sua central de gaming e comunidade
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Ações rápidas</h2>
          </div>
          <div className="w-full space-y-3">
            <GroupButton
              label="Criar Grupo"
              icon={PlusIcon}
              href="group/create"
            />
            <GroupButton
              label="Encontrar Grupos"
              icon={SearchIcon}
              href="feed"
            />
          </div>
        </div>

        {/* Notifications */}
        <NotificationCard />
      </div>
    </div>
  );
}
