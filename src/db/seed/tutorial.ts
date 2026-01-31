import { db } from "../index";
import { tutorialSections, tutorialSteps } from "../schema/tutorial";

const tutorialData = [
  {
    title: "Primeiros Passos",
    description: "Aprenda o básico da plataforma Arena Hub",
    icon: "PlayCircle",
    category: "basic" as const,
    estimatedTime: "5 min",
    order: 1,
    steps: [
      {
        title: "Bem-vindo ao Arena Hub",
        content:
          "O Arena Hub é a plataforma definitiva para gerenciamento de torneios e jogos competitivos. Aqui você pode criar grupos, organizar partidas, gerenciar equipes e acompanhar estatísticas em tempo real.",
        order: 1,
      },
      {
        title: "Navegação Principal",
        content:
          "Use o menu lateral ou as abas principais para navegar entre: Dashboard (visão geral), Partidas (gerenciar jogos), Membros (administrar participantes) e seu Perfil.",
        order: 2,
        actionButtonText: "Ir para Dashboard",
        actionButtonHref: "/home",
      },
      {
        title: "Criando seu primeiro Grupo",
        content:
          "Grupos são o coração da plataforma. Crie um grupo para organizar suas partidas e convidar outros jogadores. Cada grupo tem seu próprio código único para convites.",
        order: 3,
        actionButtonText: "Criar Grupo",
        actionButtonHref: "/home",
      },
    ],
  },
  {
    title: "Gerenciamento de Grupos",
    description: "Domine a criação e administração de grupos esportivos",
    icon: "Users",
    category: "basic" as const,
    estimatedTime: "8 min",
    order: 2,
    steps: [
      {
        title: "Tipos de Papel no Grupo",
        content:
          "Existem 4 níveis de acesso: Proprietário (controle total), Moderador (gerenciar partidas e membros), Membro (participar de partidas) e Convidado (acesso limitado).",
        order: 1,
      },
      {
        title: "Convites e Códigos",
        content:
          "Use o código único do grupo para convidar pessoas. Compartilhe o código ou envie convites diretos. Membros podem solicitar entrada ou serem adicionados diretamente.",
        order: 2,
        actionButtonText: "Ver Meus Grupos",
        actionButtonHref: "/home",
      },
      {
        title: "Configurações do Grupo",
        content:
          "Personalize nome, descrição, esporte principal e regras do grupo. Defina permissões para diferentes tipos de membros e gerencie solicitações de entrada.",
        order: 3,
      },
    ],
  },
  {
    title: "Criando Partidas",
    description: "Aprenda a organizar e gerenciar partidas esportivas",
    icon: "Gamepad2",
    category: "intermediate" as const,
    estimatedTime: "10 min",
    order: 3,
    steps: [
      {
        title: "Configuração da Partida",
        content:
          "Defina título, descrição, data/hora, local, esporte e número máximo de jogadores. Escolha entre vários esportes: futebol, basquete, vôlei, tênis, futsal e corrida.",
        order: 1,
      },
      {
        title: "Status da Partida",
        content:
          "As partidas passam por diferentes status: Inscrições Abertas → Inscrições Fechadas → Times Sorteados → Agendada → Concluída. Cada status permite ações específicas.",
        order: 2,
      },
      {
        title: "Gerenciamento de Inscrições",
        content:
          "Acompanhe quem se inscreveu, gerencie lista de espera e confirme presenças. O sistema mostra progresso de vagas preenchidas em tempo real.",
        order: 3,
      },
      {
        title: "Sorteio de Times",
        content:
          "Quando as inscrições fecham, você pode sortear times automaticamente ou formar equipes manualmente. O sistema garante equilíbrio baseado nas pontuações dos jogadores.",
        order: 4,
      },
    ],
  },
  {
    title: "Participando de Partidas",
    description: "Guia completo para jogadores participarem de partidas",
    icon: "Trophy",
    category: "basic" as const,
    estimatedTime: "6 min",
    order: 4,
    steps: [
      {
        title: "Encontrando Partidas",
        content:
          "Visualize todas as partidas disponíveis no seu grupo. Veja detalhes como data, horário, local, vagas disponíveis e status atual de cada partida.",
        order: 1,
      },
      {
        title: "Inscrições",
        content:
          "Inscreva-se em partidas abertas com um clique. Você pode cancelar sua inscrição a qualquer momento antes do fechamento das inscrições.",
        order: 2,
      },
      {
        title: "Confirmação de Presença",
        content:
          "Após as inscrições fecharem, confirme sua presença para garantir sua participação. Isso ajuda os organizadores a planejar melhor.",
        order: 3,
      },
      {
        title: "Acompanhamento em Tempo Real",
        content:
          "Receba atualizações instantâneas sobre mudanças na partida via WebSocket. Veja quando outros jogadores se inscrevem ou cancelam.",
        order: 4,
      },
    ],
  },
  {
    title: "Times e Pontuação",
    description: "Sistema de equipes e acompanhamento de pontuações",
    icon: "Zap",
    category: "intermediate" as const,
    estimatedTime: "7 min",
    order: 5,
    steps: [
      {
        title: "Formação de Equipes",
        content:
          "Times podem ser formados automaticamente (sorteio) ou manualmente pelos administradores. O sistema considera o nível de habilidade para equilíbrio.",
        order: 1,
      },
      {
        title: "Sistema de Pontuação",
        content:
          "Cada jogador tem uma pontuação individual que reflete seu desempenho. Administradores podem atualizar pontuações após as partidas.",
        order: 2,
      },
      {
        title: "Reservas e Substituições",
        content:
          "Gerencie lista de reservas para substituir jogadores que não compareceram. O sistema mantém registro de todos os participantes.",
        order: 3,
      },
      {
        title: "Resultados da Partida",
        content:
          "Registre o resultado final, atualize pontuações individuais e marque a partida como concluída. Os dados ficam salvos para histórico.",
        order: 4,
      },
    ],
  },
  {
    title: "Dashboard e Análises",
    description: "Entenda as métricas e relatórios da plataforma",
    icon: "BookOpen",
    category: "intermediate" as const,
    estimatedTime: "8 min",
    order: 6,
    steps: [
      {
        title: "Visão Geral do Dashboard",
        content:
          "O dashboard mostra estatísticas importantes: total de partidas, partidas do mês, número de membros e próximas partidas agendadas.",
        order: 1,
      },
      {
        title: "Métricas de Crescimento",
        content:
          "Acompanhe o crescimento do seu grupo com gráficos de partidas por período, taxa de participação e comparações com períodos anteriores.",
        order: 2,
      },
      {
        title: "Estatísticas de Membros",
        content:
          "Visualize dados dos membros: mais ativos, pontuações, histórico de participações e tendências de engajamento.",
        order: 3,
      },
      {
        title: "Relatórios Detalhados",
        content:
          "Gere relatórios sobre performance de jogadores, frequência de partidas, esportes mais populares e outras métricas importantes.",
        order: 4,
      },
    ],
  },
  {
    title: "Recursos Avançados",
    description: "Funcionalidades avançadas para usuários experientes",
    icon: "Crown",
    category: "advanced" as const,
    estimatedTime: "12 min",
    order: 7,
    steps: [
      {
        title: "Permissões e Papéis",
        content:
          "Configure permissões detalhadas para diferentes tipos de usuários. Defina quem pode criar partidas, gerenciar membros, atualizar pontuações e mais.",
        order: 1,
      },
      {
        title: "WebSocket em Tempo Real",
        content:
          "A plataforma usa WebSocket para atualizações em tempo real. Veja mudanças instantaneamente quando alguém se inscreve, cancela ou quando status mudam.",
        order: 2,
      },
      {
        title: "Upload de Imagens",
        content:
          "Personalize perfis e grupos com fotos. O sistema suporta upload seguro de imagens com redimensionamento automático.",
        order: 3,
      },
      {
        title: "API e Integrações",
        content:
          "A plataforma oferece APIs para integrações avançadas. Conecte com outros sistemas, automatize tarefas e crie workflows personalizados.",
        order: 4,
      },
      {
        title: "Notificações Avançadas",
        content:
          "Configure notificações personalizadas para diferentes eventos: novas partidas, lembretes, mudanças de status e atualizações importantes.",
        order: 5,
      },
    ],
  },
  {
    title: "Segurança e Boas Práticas",
    description: "Mantenha sua comunidade segura e bem organizada",
    icon: "Shield",
    category: "advanced" as const,
    estimatedTime: "6 min",
    order: 8,
    steps: [
      {
        title: "Gerenciamento de Acesso",
        content:
          "Use códigos de grupo seguros, gerencie convites cuidadosamente e revise periodicamente os membros ativos em seu grupo.",
        order: 1,
      },
      {
        title: "Moderação de Conteúdo",
        content:
          "Estabeleça regras claras, monitore atividades e use as ferramentas de moderação para manter um ambiente saudável.",
        order: 2,
      },
      {
        title: "Backup e Histórico",
        content:
          "Todos os dados são automaticamente salvos e mantidos em histórico. Configure backups regulares para informações críticas.",
        order: 3,
      },
      {
        title: "Privacidade dos Dados",
        content:
          "Entenda como os dados são tratados, configure preferências de privacidade e gerencie informações pessoais dos membros responsavelmente.",
        order: 4,
      },
    ],
  },
];

export async function seedTutorialData() {
  console.log("🌱 Seeding tutorial data...");

  try {
    // Limpar dados existentes (cuidado em produção!)
    await db.delete(tutorialSteps);
    await db.delete(tutorialSections);

    // Inserir seções e seus passos
    for (const sectionData of tutorialData) {
      const { steps, ...sectionInfo } = sectionData;

      // Inserir seção
      const [insertedSection] = await db
        .insert(tutorialSections)
        .values(sectionInfo)
        .returning();

      // Inserir passos da seção
      if (steps.length > 0) {
        const stepsToInsert = steps.map((step) => ({
          ...step,
          sectionId: insertedSection.id,
        }));

        await db.insert(tutorialSteps).values(stepsToInsert);
      }

      console.log(
        `✅ Created section: ${sectionInfo.title} with ${steps.length} steps`,
      );
    }

    console.log("🎉 Tutorial data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding tutorial data:", error);
    throw error;
  }
}

// Para executar o seed individualmente
if (require.main === module) {
  seedTutorialData()
    .then(() => {
      console.log("Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}
