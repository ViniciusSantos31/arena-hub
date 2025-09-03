import { Button } from "@/components/ui/button";
import {
  Gamepad2Icon,
  MedalIcon,
  PieChartIcon,
  Users2Icon,
} from "lucide-react";

export const GroupNav = () => {
  return (
    <nav className="md:absolute md:bottom-0 md:left-1/2 md:-translate-1/2">
      <ul className="bg-background flex justify-start overflow-x-auto border p-2 py-3 sm:justify-around md:justify-center md:rounded-2xl md:py-2">
        <li>
          <Button variant="ghost">
            <PieChartIcon />
            Dashboard
          </Button>
        </li>
        <li>
          <Button variant="ghost">
            <Users2Icon />
            Membros
          </Button>
        </li>
        <li>
          <Button variant="ghost">
            <Gamepad2Icon />
            Partidas
          </Button>
        </li>
        <li>
          <Button variant="ghost">
            <MedalIcon />
            Classificações
          </Button>
        </li>
      </ul>
    </nav>
  );
};
