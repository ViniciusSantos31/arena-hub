"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { SortMode } from "../types";

const MODES: {
  id: SortMode;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    id: "balanced",
    emoji: "⚖️",
    title: "Balanceado",
    description:
      "Os jogadores são distribuídos pelos times com base na pontuação de cada um, garantindo times equilibrados.",
  },
  {
    id: "pots",
    emoji: "🎩",
    title: "Por potes",
    description:
      "Você separa os jogadores em grupos (potes) e o sorteio garante que cada time terá pelo menos 1 jogador de cada pote.",
  },
  {
    id: "random",
    emoji: "🎲",
    title: "Aleatório",
    description:
      "Sorteio totalmente aleatório, sem nenhum critério de balanceamento ou agrupamento.",
  },
];

type ModeSelectorProps = {
  value: SortMode;
  onChange: (mode: SortMode) => void;
};

export const ModeSelector = ({ value, onChange }: ModeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 @md:grid-cols-2">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={cn(
            "flex flex-col gap-1 rounded-xl border p-4 text-left transition-all",
            "hover:border-primary/50 hover:bg-primary/5 relative",
            value === mode.id
              ? "border-primary bg-primary/5 ring-primary ring-1"
              : "border-border bg-card",
          )}
        >
          <span className="text-2xl">{mode.emoji}</span>
          <span className="font-mono text-sm font-bold">{mode.title}</span>
          <span className="text-muted-foreground text-xs leading-relaxed">
            {mode.description}
          </span>
          {value === mode.id && (
            <Badge className="absolute top-2 right-2 rounded-full">
              <CheckIcon /> Selecionado
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
};
