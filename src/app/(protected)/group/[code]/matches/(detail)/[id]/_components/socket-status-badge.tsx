import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";
import { RotateCwIcon } from "lucide-react";

export const SocketStatusBadge = () => {
  const { isConnected, isConnecting, reconnect } = useWebSocket();
  return (
    <div className="border-border/60 bg-card flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
      {isConnected && !isConnecting ? (
        <>
          <div className="bg-primary size-1.5 rounded-full" />
          <span className="text-primary font-medium">Ao vivo</span>
          <span className="text-muted-foreground before:mr-1.5 before:content-['·']">
            atualizações em tempo real
          </span>
        </>
      ) : (
        <>
          <div
            className={cn(
              "bg-destructive size-1.5 rounded-full",
              isConnecting && "animate-pulse bg-yellow-400",
            )}
          />
          {isConnecting ? (
            <span className="font-medium text-yellow-500">Conectando...</span>
          ) : (
            <span className="text-destructive font-medium">Desconectado</span>
          )}
          <span className="text-muted-foreground">
            {isConnecting ? "· aguarde" : "· dados podem estar desatualizados"}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={reconnect}
            disabled={isConnecting}
            className="ml-auto h-6 w-6"
          >
            <RotateCwIcon
              className={cn("size-3", isConnecting && "animate-spin")}
            />
          </Button>
        </>
      )}
    </div>
  );
};
