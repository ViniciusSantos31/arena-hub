import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";
import { RotateCwIcon, WifiIcon, WifiOffIcon } from "lucide-react";

export const SocketStatusBadge = () => {
  const { isConnected, isConnecting, reconnect } = useWebSocket();
  return (
    <div className="text-muted-foreground bg-card flex h-11.5 items-center gap-2 rounded-md border px-2 py-1 text-xs lg:ml-auto">
      {isConnected && !isConnecting ? (
        <>
          <WifiIcon className="text-primary size-5" />
          <div className="flex flex-col">
            <span className="text-primary">Conectado</span>
            <p>Recebendo atualizações em tempo real sobre a partida.</p>
          </div>
        </>
      ) : (
        <>
          <WifiOffIcon
            className={cn(
              "text-destructive size-5",
              isConnecting && "animate-pulse text-yellow-400",
            )}
          />
          <div className="flex flex-col">
            {isConnecting ? (
              <span className="text-yellow-400">Conectando...</span>
            ) : (
              <span className="text-destructive">Desconectado</span>
            )}
            {isConnecting ? (
              <p>
                Conectando à partida para receber atualizações em tempo real.
              </p>
            ) : (
              <p className="max-w-sm text-pretty">
                As informações da partida podem estar desatualizadas.
              </p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={reconnect}
            disabled={isConnecting}
            className="ml-auto"
          >
            <RotateCwIcon className={cn(isConnecting && "animate-spin")} />
          </Button>
        </>
      )}
    </div>
  );
};
