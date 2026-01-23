import { BellIcon, GamepadIcon, UsersIcon } from "lucide-react";

export const NotificationCard = () => {
  const notifications = [
    {
      type: "group",
      message: "Novo membro no grupo Arena Champions",
      time: "2min",
    },
    {
      type: "match",
      message: "Partida de CS2 começando em 15min",
      time: "5min",
    },
    {
      type: "group",
      message: "3 novos posts no grupo Gaming Community",
      time: "1h",
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BellIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Notificações</h2>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-card hover:bg-muted/50 rounded-lg border p-4 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {notification.type === "group" ? (
                    <UsersIcon className="h-4 w-4 text-blue-500" />
                  ) : (
                    <GamepadIcon className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium">
                    {notification.type === "group" ? "Grupo" : "Partida"}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {notification.message}
                </p>
              </div>
              <span className="text-muted-foreground text-xs">
                {notification.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/25 w-full rounded-lg border border-dashed p-4 text-sm transition-colors">
        Ver todas as notificações
      </button>
    </div>
  );
};
