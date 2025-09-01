import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { DashboardCard } from "./dashboard-card";

const recentMatch = {
  id: 1,
  name: "Partida de Quinta",
  status: "completed",
  location: "Quadra Central",
  datetime: "2024-02-15T19:00:00",
  participants: 12,
};

export const RecentMatchCard = () => {
  return (
    <DashboardCard
      title="Partida próxima"
      description="Aqui você pode ver as informações da próxima partida"
      icon={Calendar}
    >
      <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
        <div className="space-y-1">
          <h3 className="text-foreground font-semibold">{recentMatch.name}</h3>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {recentMatch.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              15/02 às 19:00
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recentMatch.participants} participantes
            </div>
          </div>
        </div>
        <Badge
          variant={recentMatch.status === "completed" ? "default" : "secondary"}
        >
          {recentMatch.status === "completed" ? "Finalizada" : "Em andamento"}
        </Badge>
      </div>
    </DashboardCard>
  );
};
