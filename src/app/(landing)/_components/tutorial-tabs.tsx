"use client";

import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CheckCircle2Icon,
  LayoutDashboardIcon,
  ShuffleIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  {
    id: "group",
    label: "Seu Grupo",
    icon: UsersIcon,
    number: "01",
    title: "Configure tudo do jeito que você quer",
    description:
      "Seu grupo é o hub central. Personalize, controle o acesso e gerencie quem faz parte — tudo sem precisar do WhatsApp.",
    steps: [
      "Crie um grupo com nome, foto, descrição e esporte",
      "Escolha se o grupo é público (visível no feed) ou privado",
      "Gere links de convite com limite de uso e validade",
      "Aprove ou recuse solicitações de entrada",
      "Atribua papéis: Moderador, Membro ou Convidado",
      "Defina quem pode criar partidas e adicionar membros",
    ],
  },
  {
    id: "roles",
    label: "Papéis",
    icon: Users2Icon,
    number: "02",
    title: "Controle de acesso e responsabilidades",
    description:
      "No grupo, existem 4 níveis de acesso: Proprietário, Moderador, Membro e Convidado.",
    steps: [
      "Proprietário: Tem controle total sobre o grupo, pode criar partidas, gerenciar membros e tomar decisões importantes.",
      "Moderador: Tem controle sobre as partidas, pode gerenciar membros e tomar decisões importantes.",
      "Membro: Tem acesso ao grupo, pode se inscrever em partidas e participar das partidas.",
      "Convidado: Tem acesso ao grupo, pode se inscrever em partidas e participar das partidas, mas não tem prioridade de inscrição e entra direto na fila de espera.",
    ],
  },
  {
    id: "matches",
    label: "Partidas",
    icon: CalendarIcon,
    number: "03",
    title: "Da criação à confirmação em segundos",
    description:
      "Crie a partida, abra as inscrições e deixe o sistema fazer o resto. Chega de ficar contando emoji no grupo.",
    steps: [
      "Defina título, data, horário, local e número de vagas",
      "Membros se inscrevem com um toque",
      "Fila de espera automática quando as vagas esgotam",
      "Feche as inscrições quando quiser",
      "Acompanhe em tempo real quem confirmou",
      "Remova ou substitua jogadores sem bagunça",
    ],
  },
  {
    id: "teams",
    label: "Sorteio de Times",
    icon: ShuffleIcon,
    number: "04",
    title: "Times equilibrados, sem discussão",
    description:
      "Esqueça o dedinho apontando. O sorteio é feito automaticamente e pode ser configurado para ficar justo de verdade.",
    steps: [
      "Veja a lista completa de jogadores confirmados",
      "Escolha o modo: aleatório ou por potes de nível",
      "Monte potes para separar os melhores e equilibrar os times",
      "Gere e salve os times com um clique",
      "Resultado disponível para todos os membros do grupo",
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    number: "05",
    title: "Visão geral de tudo que acontece",
    description:
      "Acompanhe a saúde do grupo, quem participa mais e mantenha tudo organizado com o checklist de configuração.",
    steps: [
      "Ranking de participação dos membros do grupo",
      "Próxima partida sempre em destaque",
      "Histórico de partidas realizadas",
      "Checklist guiado para configurar grupos novos",
      "Gerencie privacidade e permissões a qualquer hora",
    ],
  },
];

export function TutorialTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === activeTab)!;
  const Icon = current.icon;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground bg-transparent",
              )}
            >
              <TabIcon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="border-border/60 bg-card/50 rounded-2xl border p-8 backdrop-blur-sm md:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Icon className="text-primary size-6" />
              </div>
              <span className="text-primary/60 text-4xl font-black tabular-nums">
                {current.number}
              </span>
            </div>
            <h3 className="text-foreground mb-3 text-2xl font-bold">
              {current.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {current.description}
            </p>
          </div>

          <ul className="space-y-3">
            {current.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2Icon className="text-primary mt-0.5 size-5 shrink-0" />
                <span className="text-foreground/80 text-sm leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={`Ver aba ${tab.label}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              activeTab === tab.id ? "bg-primary w-6" : "bg-border w-1.5",
            )}
          />
        ))}
      </div>
    </div>
  );
}
