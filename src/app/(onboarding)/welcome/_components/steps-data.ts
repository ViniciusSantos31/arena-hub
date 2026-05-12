import {
  CalendarIcon,
  CheckCircle2Icon,
  CrownIcon,
  EyeIcon,
  LinkIcon,
  ShieldIcon,
  ShuffleIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StepItem {
  icon: LucideIcon;
  text: string;
}

export interface RoleCard {
  icon: LucideIcon;
  name: string;
  description: string;
  permissions: string[];
  highlight?: boolean;
}

export interface TutorialStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: "welcome" | "features" | "roles" | "finish";
  items?: StepItem[];
  roles?: RoleCard[];
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Arena Hub",
    subtitle: "Seu esporte organizado, do jeito certo",
    description:
      "O Arena Hub é a plataforma completa para organizar seus jogos, gerenciar seu grupo e nunca mais depender de grupos de WhatsApp. Neste tutorial rápido, vamos mostrar tudo que você precisa saber para começar.",
    type: "welcome",
    items: [
      { icon: UsersIcon, text: "Crie e gerencie grupos esportivos" },
      { icon: CalendarIcon, text: "Organize partidas com inscrições automáticas" },
      { icon: ShuffleIcon, text: "Sorteie times equilibrados com um clique" },
      { icon: SparklesIcon, text: "Conecte-se com jogadores pela vitrine" },
    ],
  },
  {
    id: "group-creation",
    title: "Criação de Grupo",
    subtitle: "Seu hub central de organização",
    description:
      "O grupo é o ponto de partida de tudo. Personalize e gerencie quem faz parte — sem precisar de nenhum aplicativo de mensagens.",
    type: "features",
    items: [
      { icon: UsersIcon, text: "Crie um grupo com nome, foto e descrição" },
      {
        icon: CheckCircle2Icon,
        text: "Defina o número máximo de jogadores do grupo",
      },
      {
        icon: ShieldIcon,
        text: "Configure regras personalizadas para o seu grupo",
      },
      {
        icon: LinkIcon,
        text: "Convide membros exclusivamente via links de convite",
      },
    ],
  },
  {
    id: "roles",
    title: "Cargos e Funções",
    subtitle: "Controle de acesso e responsabilidades",
    description:
      "Cada membro tem um cargo com permissões específicas. Distribua responsabilidades e mantenha a organização do grupo com clareza.",
    type: "roles",
    roles: [
      {
        icon: CrownIcon,
        name: "Proprietário",
        description: "Controle total sobre o grupo",
        permissions: [
          "Gerencia configurações do grupo",
          "Promove e remove membros",
          "Cria e encerra partidas",
          "Gera links de convite",
          "Acesso irrestrito a todas as funções",
        ],
        highlight: true,
      },
      {
        icon: ShieldIcon,
        name: "Moderador",
        description: "Ajuda na gestão do dia a dia",
        permissions: [
          "Gerencia membros e convites",
          "Cria e gerencia partidas",
          "Gera links de convite",
          "Remove membros do grupo",
        ],
      },
      {
        icon: UserIcon,
        name: "Membro",
        description: "Participante ativo do grupo",
        permissions: [
          "Visualiza todas as partidas",
          "Se inscreve em partidas",
          "Entra na fila de espera",
          "Tem prioridade sobre Convidados",
        ],
      },
      {
        icon: UsersIcon,
        name: "Convidado",
        description: "Participante ocasional",
        permissions: [
          "Visualiza as partidas do grupo",
          "Pode se inscrever em partidas",
          "Entra direto na fila de espera",
          "Sem prioridade de inscrição",
        ],
      },
    ],
  },
  {
    id: "invite-links",
    title: "Links de Convite",
    subtitle: "Expanda seu grupo com facilidade",
    description:
      "Gere links inteligentes para convidar jogadores. Configure limites de uso, prazo de validade e compartilhe onde quiser — sem precisar adicionar um a um.",
    type: "features",
    items: [
      { icon: LinkIcon, text: "Gere links únicos com um clique" },
      { icon: CheckCircle2Icon, text: "Defina um número máximo de usos por link" },
      {
        icon: CalendarIcon,
        text: "Configure data de expiração para controlar o acesso",
      },
      {
        icon: ShieldIcon,
        text: "Revogue links a qualquer momento por segurança",
      },
      {
        icon: UsersIcon,
        text: "Acompanhe quantas pessoas já usaram cada link",
      },
    ],
  },
  {
    id: "discover",
    title: "Vitrine de Jogadores",
    subtitle: "Conecte-se com a comunidade",
    description:
      "A Vitrine é onde jogadores se encontram. Ative seu perfil público quando estiver procurando por grupos e apareça para outros jogadores te encontrarem.",
    type: "features",
    items: [
      {
        icon: EyeIcon,
        text: "Ative \"Procurando grupo\" no seu perfil para aparecer na vitrine",
      },
      {
        icon: SparklesIcon,
        text: "Veja outros jogadores que também estão procurando grupos",
      },
      {
        icon: UserIcon,
        text: "Seu perfil público fica visível apenas quando você ativa essa opção",
      },
      {
        icon: ShieldIcon,
        text: "Desative a qualquer momento para sair da vitrine",
      },
    ],
  },
  {
    id: "matches",
    title: "Criação de Partidas",
    subtitle: "Da criação à confirmação em segundos",
    description:
      "Crie a partida, abra as inscrições e deixe o sistema fazer o resto. Chega de ficar contando emoji no grupo ou fazendo planilhas.",
    type: "features",
    items: [
      {
        icon: CalendarIcon,
        text: "Defina título, data, horário, local e número de vagas",
      },
      { icon: CheckCircle2Icon, text: "Membros se inscrevem com um toque" },
      {
        icon: UsersIcon,
        text: "Fila de espera automática quando as vagas esgotam",
      },
      {
        icon: ShuffleIcon,
        text: "Sorteio de times por nível para jogos equilibrados",
      },
      {
        icon: ShieldIcon,
        text: "Feche as inscrições e gerencie substituições facilmente",
      },
    ],
  },
  {
    id: "finish",
    title: "Tudo Pronto!",
    subtitle: "Hora de jogar",
    description:
      "Você já sabe tudo que precisa para começar. Crie seu primeiro grupo, convide seus amigos e organize a próxima partida agora mesmo.",
    type: "finish",
    items: [
      { icon: CheckCircle2Icon, text: "Crie seu grupo e personalize as configurações" },
      { icon: LinkIcon, text: "Gere um link de convite e chame seus amigos" },
      { icon: CalendarIcon, text: "Crie sua primeira partida" },
      { icon: ShuffleIcon, text: "Sorteie os times e bora jogar!" },
    ],
  },
];
