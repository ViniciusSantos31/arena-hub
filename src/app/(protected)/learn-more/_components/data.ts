import {
  BookOpen,
  Crown,
  Gamepad2,
  PlayCircle,
  Shield,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { TutorialSection } from "./types";

export const tutorialSections: TutorialSection[] = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    description: "Aprenda o básico da plataforma Arena Hub",
    icon: PlayCircle,
    category: "basic",
    estimatedTime: "5 min",
    steps: [
      {
        title: "Bem-vindo ao Arena Hub",
        content:
          "O Arena Hub é a plataforma definitiva para gerenciamento de torneios e jogos competitivos. Aqui você pode criar grupos, organizar partidas, gerenciar equipes e acompanhar estatísticas em tempo real.",
      },
      {
        title: "Navegação Principal",
        content:
          "Use o menu lateral ou as abas principais para navegar entre: Dashboard (visão geral), Partidas (gerenciar jogos), Membros (administrar participantes) e seu Perfil.",
        actionButton: {
          text: "Ir para Dashboard",
          href: "/home",
        },
      },
      {
        title: "Criando seu primeiro Grupo",
        content:
          "Grupos são o coração da plataforma. Crie um grupo para organizar suas partidas e convidar outros jogadores. Cada grupo tem seu próprio código único para convites.",
        actionButton: {
          text: "Criar Grupo",
          href: "/home",
        },
      },
    ],
  },
  {
    id: "groups-management",
    title: "Gerenciamento de Grupos",
    description: "Domine a criação e administração de grupos esportivos",
    icon: Users,
    category: "basic",
    estimatedTime: "8 min",
    steps: [
      {
        title: "Tipos de Papel no Grupo",
        content:
          "Existem 4 níveis de acesso: Proprietário (controle total), Moderador (gerenciar partidas e membros), Membro (participar de partidas) e Convidado (acesso limitado).",
      },
      {
        title: "Convites e Códigos",
        content:
          "Use o código único do grupo para convidar pessoas. Compartilhe o código ou envie convites diretos. Membros podem solicitar entrada ou serem adicionados diretamente.",
        actionButton: {
          text: "Ver Meus Grupos",
          href: "/home",
        },
      },
      {
        title: "Configurações do Grupo",
        content:
          "Personalize nome, descrição, esporte principal e regras do grupo. Defina permissões para diferentes tipos de membros e gerencie solicitações de entrada.",
      },
    ],
  },
  {
    id: "match-creation",
    title: "Criando Partidas",
    description: "Aprenda a organizar e gerenciar partidas esportivas",
    icon: Gamepad2,
    category: "intermediate",
    estimatedTime: "10 min",
    steps: [
      {
        title: "Configuração da Partida",
        content:
          "Defina título, descrição, data/hora, local, esporte e número máximo de jogadores. Escolha entre vários esportes: futebol, basquete, vôlei, tênis, futsal e corrida.",
      },
      {
        title: "Status da Partida",
        content:
          "As partidas passam por diferentes status: Inscrições Abertas → Inscrições Fechadas → Times Sorteados → Agendada → Concluída. Cada status permite ações específicas.",
      },
      {
        title: "Gerenciamento de Inscrições",
        content:
          "Acompanhe quem se inscreveu, gerencie lista de espera e confirme presenças. O sistema mostra progresso de vagas preenchidas em tempo real.",
      },
      {
        title: "Sorteio de Times",
        content:
          "Quando as inscrições fecham, você pode sortear times automaticamente ou formar equipes manualmente. O sistema garante equilíbrio baseado nas pontuações dos jogadores.",
      },
    ],
  },
  {
    id: "match-participation",
    title: "Participando de Partidas",
    description: "Guia completo para jogadores participarem de partidas",
    icon: Trophy,
    category: "basic",
    estimatedTime: "6 min",
    steps: [
      {
        title: "Encontrando Partidas",
        content:
          "Visualize todas as partidas disponíveis no seu grupo. Veja detalhes como data, horário, local, vagas disponíveis e status atual de cada partida.",
      },
      {
        title: "Inscrições",
        content:
          "Inscreva-se em partidas abertas com um clique. Você pode cancelar sua inscrição a qualquer momento antes do fechamento das inscrições.",
      },
      {
        title: "Confirmação de Presença",
        content:
          "Após as inscrições fecharem, confirme sua presença para garantir sua participação. Isso ajuda os organizadores a planejar melhor.",
      },
      {
        title: "Acompanhamento em Tempo Real",
        content:
          "Receba atualizações instantâneas sobre mudanças na partida via WebSocket. Veja quando outros jogadores se inscrevem ou cancelam.",
      },
    ],
  },
  {
    id: "teams-scoring",
    title: "Times e Pontuação",
    description: "Sistema de equipes e acompanhamento de pontuações",
    icon: Zap,
    category: "intermediate",
    estimatedTime: "7 min",
    steps: [
      {
        title: "Formação de Equipes",
        content:
          "Times podem ser formados automaticamente (sorteio) ou manualmente pelos administradores. O sistema considera o nível de habilidade para equilíbrio.",
      },
      {
        title: "Sistema de Pontuação",
        content:
          "Cada jogador tem uma pontuação individual que reflete seu desempenho. Administradores podem atualizar pontuações após as partidas.",
      },
      {
        title: "Reservas e Substituições",
        content:
          "Gerencie lista de reservas para substituir jogadores que não compareceram. O sistema mantém registro de todos os participantes.",
      },
      {
        title: "Resultados da Partida",
        content:
          "Registre o resultado final, atualize pontuações individuais e marque a partida como concluída. Os dados ficam salvos para histórico.",
      },
    ],
  },
  {
    id: "analytics-dashboard",
    title: "Dashboard e Análises",
    description: "Entenda as métricas e relatórios da plataforma",
    icon: BookOpen,
    category: "intermediate",
    estimatedTime: "8 min",
    steps: [
      {
        title: "Visão Geral do Dashboard",
        content:
          "O dashboard mostra estatísticas importantes: total de partidas, partidas do mês, número de membros e próximas partidas agendadas.",
      },
      {
        title: "Métricas de Crescimento",
        content:
          "Acompanhe o crescimento do seu grupo com gráficos de partidas por período, taxa de participação e comparações com períodos anteriores.",
      },
      {
        title: "Estatísticas de Membros",
        content:
          "Visualize dados dos membros: mais ativos, pontuações, histórico de participações e tendências de engajamento.",
      },
      {
        title: "Relatórios Detalhados",
        content:
          "Gere relatórios sobre performance de jogadores, frequência de partidas, esportes mais populares e outras métricas importantes.",
      },
    ],
  },
  {
    id: "advanced-features",
    title: "Recursos Avançados",
    description: "Funcionalidades avançadas para usuários experientes",
    icon: Crown,
    category: "advanced",
    estimatedTime: "12 min",
    steps: [
      {
        title: "Permissões e Papéis",
        content:
          "Configure permissões detalhadas para diferentes tipos de usuários. Defina quem pode criar partidas, gerenciar membros, atualizar pontuações e mais.",
      },
      {
        title: "WebSocket em Tempo Real",
        content:
          "A plataforma usa WebSocket para atualizações em tempo real. Veja mudanças instantaneamente quando alguém se inscreve, cancela ou quando status mudam.",
      },
      {
        title: "Upload de Imagens",
        content:
          "Personalize perfis e grupos com fotos. O sistema suporta upload seguro de imagens com redimensionamento automático.",
      },
      {
        title: "API e Integrações",
        content:
          "A plataforma oferece APIs para integrações avançadas. Conecte com outros sistemas, automatize tarefas e crie workflows personalizados.",
      },
      {
        title: "Notificações Avançadas",
        content:
          "Configure notificações personalizadas para diferentes eventos: novas partidas, lembretes, mudanças de status e atualizações importantes.",
      },
    ],
  },
  {
    id: "security-best-practices",
    title: "Segurança e Boas Práticas",
    description: "Mantenha sua comunidade segura e bem organizada",
    icon: Shield,
    category: "advanced",
    estimatedTime: "6 min",
    steps: [
      {
        title: "Gerenciamento de Acesso",
        content:
          "Use códigos de grupo seguros, gerencie convites cuidadosamente e revise periodicamente os membros ativos em seu grupo.",
      },
      {
        title: "Moderação de Conteúdo",
        content:
          "Estabeleça regras claras, monitore atividades e use as ferramentas de moderação para manter um ambiente saudável.",
      },
      {
        title: "Backup e Histórico",
        content:
          "Todos os dados são automaticamente salvos e mantidos em histórico. Configure backups regulares para informações críticas.",
      },
      {
        title: "Privacidade dos Dados",
        content:
          "Entenda como os dados são tratados, configure preferências de privacidade e gerencie informações pessoais dos membros responsavelmente.",
      },
    ],
  },
];

export default tutorialSections;
