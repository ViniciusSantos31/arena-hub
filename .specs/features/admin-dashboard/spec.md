# Admin Dashboard — Especificação

## Problem Statement

O painel administrativo do Arena Hub (`/admin`) possui rotas em produção (dashboard, grupos, feedbacks, tutorial, novidades), mas apresenta lacunas críticas: `/admin/users` e `/admin/matches` usam dados mock, não há visibilidade de billing/assinaturas, a autenticação está duplicada e incompleta nas server actions, e métricas operacionais importantes (retenção, MRR, alertas) não existem. O administrador não consegue responder perguntas fundamentais sobre saúde da plataforma, receita recorrente e suporte a usuários.

## Goals

- [ ] Centralizar autenticação admin com `assertAdmin()` em todas as server actions e layout
- [ ] Substituir mocks de usuários e partidas por dados reais com paginação server-side
- [ ] Expor KPIs de saúde da plataforma (retenção, MRR, alertas operacionais) no dashboard
- [ ] Criar módulo de billing para assinaturas da plataforma (sem receita transacional de partidas)
- [ ] Enriquecer módulos existentes (grupos, tutorial) e adicionar analytics de crescimento/moderação
- [ ] Responder às 7 perguntas norte definidas na seção Success Criteria

## Out of Scope

| Feature | Motivo |
|---------|--------|
| Métricas de partidas pagas | Feature não será oferecida no curto prazo |
| Stripe Connect (onboarding, status) | Idem |
| GMV / receita transacional de partidas | Idem |
| Status de pagamento de jogadores (`player.paymentStatus`) | Idem |
| Toggle `paidMatchesFeatureEnabled` no admin | Remover ou ocultar da UI |
| Reembolsos / isenções de partidas | Idem |
| Telemetria externa (PostHog, Mixpanel) | Fora do escopo inicial |
| Multi-admin / RBAC no banco | Avaliar em fase futura |
| Impersonação de usuário | Alto risco, fase futura |
| Ban/suspensão de conta global | Requer novo schema, fase futura |

---

## Definições

### Administrador

Usuário autenticado cujo e-mail coincide com `process.env.ADMIN_EMAIL`. Único perfil com acesso a `/admin`.

### Usuário ativo (proxy)

Usuário com registro em `player` ou `match` nos últimos N dias (7 ou 30).

### Grupo ativo (proxy)

Organização com `lastActivityAt` ou partida recente nos últimos N dias.

### Assinante ativo

Registro em `user_billing_subscription` com status `active` ou `trialing`.

### MRR estimado

Soma de `PLAN_TIER_PRICES[tier]` para cada assinante ativo (preços fixos: basic R$ 5, intermediate R$ 15, premium R$ 50).

### Early adopter

Usuário com `user.isEarlyAdopter = true`; pode criar até 2 grupos sem assinatura.

### Ciclo de vida da partida

`scheduled → open_registration → closed_registration → team_sorted → completed | cancelled`

---

## User Stories

### Epic 0 — Fundação (P0) ⭐ Pré-requisito

#### P0: Autenticação admin centralizada

**User Story**: Como administrador, quero que todas as rotas e actions admin exijam verificação consistente, para que nenhum dado sensível seja acessível sem autorização.

**Why P0**: Bloqueador de segurança; pré-requisito de todos os outros épicos.

**Acceptance Criteria**:

1. WHEN uma server action admin é invocada THEN o sistema SHALL chamar `assertAdmin()` no início e rejeitar usuários não-admin
2. WHEN um usuário não-admin acessa `/admin/*` THEN o sistema SHALL redirecionar para `/`
3. WHEN `getTutorialOverallStats` ou actions em `src/actions/tutorial/admin.ts` são invocadas THEN o sistema SHALL exigir `assertAdmin()`
4. WHEN o layout admin carrega THEN o sistema SHALL reutilizar a mesma lógica de `assertAdmin()` (sem duplicar verificação inline)

**Independent Test**: Invocar action admin sem sessão admin → erro/acesso negado; acessar `/admin/dashboard` como usuário comum → redirect.

**Requirements**: ADM-FOUND-01, ADM-FOUND-02, ADM-FOUND-03

---

#### P0: Padronização de componentes e correções

**User Story**: Como administrador, quero componentes reutilizáveis e dados corretos, para operar o painel sem bugs visuais ou inconsistências.

**Acceptance Criteria**:

1. WHEN a pasta `_componentes` existir THEN o sistema SHALL unificar para `_components`
2. WHEN `GroupAdminCard` renderiza um grupo THEN o sistema SHALL exibir corretamente público vs privado conforme `organization.private`
3. WHEN queries de série temporal são executadas THEN o sistema SHALL usar `GROUP BY` SQL em vez de filtrar em memória
4. WHEN uma listagem admin precisa de tabela, filtro de data ou estado vazio THEN o sistema SHALL oferecer `AdminDataTable`, `AdminDateRangeFilter`, `AdminEmptyState`

**Requirements**: ADM-FOUND-04, ADM-FOUND-05, ADM-FOUND-06, ADM-FOUND-07

---

### Epic 1 — Dashboard executivo v2 (P1)

#### P1: Métricas de saúde da plataforma

**User Story**: Como administrador, quero ver KPIs de retenção, receita e alertas operacionais, para avaliar a saúde do negócio em um único painel.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/dashboard` THEN o sistema SHALL exibir usuários ativos (7d/30d), grupos ativos (7d/30d), taxa de conclusão de partidas, assinantes ativos, MRR estimado, early adopters, assinaturas `past_due`, feedbacks pendentes, push subscriptions ativas e média de membros por grupo
2. WHEN o admin seleciona período (7/30/90 dias) THEN o sistema SHALL atualizar métricas temporais conforme o período
3. WHEN existem feedbacks pendentes ou assinaturas `past_due` THEN o sistema SHALL exibir cards de alerta com links para `/admin/feedbacks` e `/admin/billing`
4. WHEN `adminExecutiveMetrics` é invocado THEN o sistema SHALL chamar `assertAdmin()` e retornar tipos exportados (`AdminExecutiveMetricsData`)

**Independent Test**: Dashboard exibe MRR coerente com contagem de assinantes × preço do tier; alertas aparecem quando há feedbacks pendentes.

**Requirements**: ADM-DASH-01, ADM-DASH-02, ADM-DASH-03, ADM-DASH-04

---

### Epic 2 — Usuários (P1)

#### P1: Listagem de usuários com filtros

**User Story**: Como administrador, quero listar e filtrar usuários reais, para dar suporte e entender a base de usuários.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/users` THEN o sistema SHALL exibir tabela paginada (server-side) com nome, email, avatar, email verificado, early adopter, plano, status assinatura, grupos como owner, partidas jogadas, progresso tutorial, LFG ativo e data de cadastro
2. WHEN o admin aplica filtros (plano, status assinatura, early adopter, verificado, período cadastro, busca nome/email) THEN o sistema SHALL retornar resultados filtrados com paginação
3. WHEN `listAdminUsers` é invocado THEN o sistema SHALL usar `assertAdmin()`, `LIMIT`/`OFFSET` e exportar tipos de retorno
4. WHEN não há resultados THEN o sistema SHALL exibir `AdminEmptyState`

**Requirements**: ADM-USER-01, ADM-USER-02, ADM-USER-03

---

#### P1: Detalhe do usuário (read-only)

**User Story**: Como administrador, quero ver o perfil completo de um usuário, para investigar casos de suporte.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/users/[id]` THEN o sistema SHALL exibir perfil, grupos (owner e membro), assinatura atual, progresso tutorial, feedbacks enviados e partidas recentes
2. WHEN o usuário possui assinatura Stripe THEN o sistema SHALL exibir link read-only para Stripe Dashboard (nova aba)
3. WHEN o ID não existe THEN o sistema SHALL exibir página 404 ou estado vazio apropriado

**Requirements**: ADM-USER-04, ADM-USER-05, ADM-USER-06

---

#### P2: Ações administrativas em usuários

**User Story**: Como administrador, quero conceder/revogar early adopter e forçar sync de assinatura, para resolver casos excepcionais.

**Acceptance Criteria**:

1. WHEN o admin alterna early adopter THEN o sistema SHALL atualizar `user.isEarlyAdopter` via `setAdminUserEarlyAdopter`
2. WHEN o admin força sync de assinatura THEN o sistema SHALL reprocessar via `sync-subscription.ts` existente
3. WHEN ações são executadas THEN o sistema SHALL registrar feedback visual (toast) de sucesso/erro

**Requirements**: ADM-USER-07, ADM-USER-08

---

### Epic 3 — Partidas globais (P2)

#### P2: Listagem e métricas de partidas

**User Story**: Como administrador, quero ver todas as partidas da plataforma com filtros, para monitorar operação diária.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/matches` THEN o sistema SHALL exibir métricas (por status, esporte/categoria, taxa preenchimento, cancelamento, tempo médio conclusão, top grupos) e listagem paginada
2. WHEN filtros são aplicados (grupo, status, data, esporte, busca título) THEN o sistema SHALL retornar resultados server-side
3. WHEN o item "Partidas" no menu admin é exibido THEN o sistema SHALL estar descomentado e funcional (não mock)

**Requirements**: ADM-MATCH-01, ADM-MATCH-02, ADM-MATCH-03

---

#### P2: Detalhe da partida

**User Story**: Como administrador, quero ver detalhes de uma partida e seus jogadores, para investigar problemas operacionais.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/matches/[id]` THEN o sistema SHALL exibir dados da partida, jogadores (confirmados e fila), link para grupo
2. WHEN timeline de status estiver disponível no schema THEN o sistema SHALL exibi-la; caso contrário, exibir status atual apenas

**Requirements**: ADM-MATCH-04, ADM-MATCH-05

---

#### P3: Cancelar partida (override admin)

**User Story**: Como administrador, quero cancelar uma partida em casos excepcionais, reutilizando lógica existente.

**Acceptance Criteria**:

1. WHEN o admin confirma cancelamento THEN o sistema SHALL reutilizar lógica de cancelamento existente com override admin
2. WHEN cancelamento é bem-sucedido THEN o sistema SHALL atualizar status para `cancelled`

**Requirements**: ADM-MATCH-06

---

### Epic 4 — Billing e assinaturas (P1)

#### P1: Métricas de billing

**User Story**: Como administrador, quero ver MRR, distribuição por tier e sinais de churn, para acompanhar receita recorrente.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/billing` THEN o sistema SHALL exibir MRR estimado, assinantes por tier, novas assinaturas no período, cancelamentos, `past_due`, `cancelAtPeriodEnd`, early adopters sem plano e distribuição de status
2. WHEN `adminBillingMetrics` é invocado THEN o sistema SHALL usar `assertAdmin()` e preços de `plan-tiers.ts`

**Requirements**: ADM-BILL-01, ADM-BILL-02

---

#### P1: Listagem de assinaturas

**User Story**: Como administrador, quero listar assinaturas com detalhes de período e status, para suporte de billing.

**Acceptance Criteria**:

1. WHEN o admin visualiza listagem THEN o sistema SHALL exibir usuário (nome, email), tier, status, período atual, `cancelAtPeriodEnd`, `gracePeriodEndsAt` com paginação server-side
2. WHEN o admin clica em link Stripe THEN o sistema SHALL abrir assinatura no Stripe Dashboard (read-only, nova aba)

**Requirements**: ADM-BILL-03, ADM-BILL-04

---

#### P2: Forçar sync de assinatura

**User Story**: Como administrador, quero forçar reprocessamento de uma assinatura, para corrigir divergências com Stripe.

**Acceptance Criteria**:

1. WHEN o admin aciona sync THEN o sistema SHALL invocar `sync-subscription.ts` e atualizar UI com resultado

**Requirements**: ADM-BILL-05

---

### Epic 5 — Grupos v2 (P2)

#### P2: Métricas enriquecidas no grupo

**User Story**: Como administrador, quero métricas operacionais por grupo, para identificar grupos inativos ou com problemas.

**Acceptance Criteria**:

1. WHEN card ou detalhe de grupo é exibido THEN o sistema SHALL incluir taxa ocupação, partidas 30d, taxa conclusão, pedidos pendentes, links ativos, punições recentes
2. WHEN detalhe tem tabs THEN o sistema SHALL incluir Convites (read-only) e Pedidos de entrada (se privado)
3. WHEN UI admin exibe toggle de partidas pagas THEN o sistema SHALL removê-lo ou ocultá-lo

**Requirements**: ADM-GROUP-01, ADM-GROUP-02, ADM-GROUP-03

---

#### P3: Moderação de pedidos de entrada (override admin)

**User Story**: Como administrador, quero aprovar/rejeitar pedidos de entrada em grupos privados, para desbloquear casos de suporte.

**Acceptance Criteria**:

1. WHEN o admin aprova/rejeita pedido THEN o sistema SHALL aplicar override admin reutilizando lógica existente de `requests`

**Requirements**: ADM-GROUP-04

---

### Epic 6 — Crescimento e aquisição (P3)

#### P3: Analytics de crescimento (read-only)

**User Story**: Como administrador, quero entender canais de aquisição e conversão de convites, para avaliar crescimento orgânico.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/growth` THEN o sistema SHALL exibir métricas de links de convite (criados/revogados/consumidos), taxa conversão, convites diretos, pedidos de entrada (submetidos/aprovados/rejeitados), usuários LFG ativo e novos usuários por provider
2. WHEN fase 1 THEN o sistema SHALL ser read-only (sem ações de modificação)

**Requirements**: ADM-GROW-01, ADM-GROW-02

---

### Epic 7 — Moderação e qualidade (P3)

#### P3: Central de moderação

**User Story**: Como administrador, quero visão consolidada de qualidade da comunidade, além da moderação de feedbacks existente.

**Acceptance Criteria**:

1. WHEN módulo de moderação é acessado THEN o sistema SHALL exibir rating médio de feedbacks, pendentes, punições por período, membros suspensos e grupos com alta taxa de cancelamento
2. WHEN listagem cross-grupo de punições é exibida THEN o sistema SHALL ser read-only (fase 1)
3. WHEN moderação de feedbacks existente é usada THEN o sistema SHALL permanecer funcional (aprovar/reprovar/desaprovar)

**Requirements**: ADM-MOD-01, ADM-MOD-02, ADM-MOD-03

---

### Epic 8 — Tutorial CRUD (P3)

#### P3: Gestão de conteúdo do tutorial

**User Story**: Como administrador, quero CRUD de seções e passos do tutorial, para atualizar onboarding sem deploy manual.

**Acceptance Criteria**:

1. WHEN o admin acessa `/admin/tutorial/content` THEN o sistema SHALL permitir criar, editar e excluir seções e passos
2. WHEN actions em `src/actions/tutorial/admin.ts` são invocadas THEN o sistema SHALL exigir `assertAdmin()`
3. WHEN analytics em `/admin/tutorial` são acessados THEN o sistema SHALL incluir drop-off por passo individual (além de por seção)

**Requirements**: ADM-TUT-01, ADM-TUT-02, ADM-TUT-03

---

### Epic 9 — Novidades incremental (P4)

#### P4: Melhorias opcionais em novidades

**User Story**: Como administrador, quero analytics mais ricos de novidades, para medir impacto de comunicações.

**Acceptance Criteria**:

1. WHEN implementado THEN o sistema MAY exibir gráfico de views ao longo do tempo, filtro por `requiredAction` e preview responsivo
2. WHEN funcionalidade existente de CRUD/estatísticas é usada THEN o sistema SHALL permanecer intacta

**Requirements**: ADM-ANN-01, ADM-ANN-02

---

### Epic 10 — Busca global (P4)

#### P4: Busca rápida no admin

**User Story**: Como administrador, quero buscar por email, nome, código de grupo ou título de partida, para navegar rapidamente.

**Acceptance Criteria**:

1. WHEN o admin usa Cmd+K ou input fixo THEN o sistema SHALL retornar links para detalhes de user/group/match
2. WHEN busca é executada THEN o sistema SHALL exigir `assertAdmin()` e limitar resultados (ex.: top 10 por categoria)

**Requirements**: ADM-SEARCH-01, ADM-SEARCH-02

---

## Edge Cases

- WHEN volume de dados excede paginação THEN o sistema SHALL usar `LIMIT`/`OFFSET` server-side (nunca carregar tudo em memória)
- WHEN usuário não possui assinatura THEN colunas de plano/status SHALL exibir estado vazio ou "Sem plano"
- WHEN early adopter não tem subscription ativa THEN billing SHALL contabilizá-lo no segmento dedicado
- WHEN `ADMIN_EMAIL` não está configurado THEN layout SHALL negar acesso a todos
- WHEN query de usuário ativo não encontra `player`/`match` recente THEN usuário SHALL contar como inativo
- WHEN partida está em status terminal (`completed`/`cancelled`) THEN taxa de conclusão SHALL usar fórmula `completed / (completed + cancelled)`
- WHEN grupo é público THEN tab "Pedidos de entrada" SHALL estar oculta ou vazia

---

## Requirement Traceability

| Requirement ID | Epic | Story | Prioridade | Status |
|----------------|------|-------|------------|--------|
| ADM-FOUND-01 | 0 | Auth centralizada | P0 | Pending |
| ADM-FOUND-02 | 0 | Redirect não-admin | P0 | Pending |
| ADM-FOUND-03 | 0 | Auth actions órfãs | P0 | Pending |
| ADM-FOUND-04 | 0 | Unificar `_components` | P0 | Pending |
| ADM-FOUND-05 | 0 | Fix público/privado card | P0 | Pending |
| ADM-FOUND-06 | 0 | Otimizar queries temporais | P0 | Pending |
| ADM-FOUND-07 | 0 | Componentes base admin | P0 | Pending |
| ADM-DASH-01 | 1 | KPIs dashboard v2 | P1 | Pending |
| ADM-DASH-02 | 1 | Seletor de período | P1 | Pending |
| ADM-DASH-03 | 1 | Cards de alerta | P1 | Pending |
| ADM-DASH-04 | 1 | Action executive metrics | P1 | Pending |
| ADM-USER-01 | 2 | Listagem usuários | P1 | Pending |
| ADM-USER-02 | 2 | Filtros usuários | P1 | Pending |
| ADM-USER-03 | 2 | Paginação server-side | P1 | Pending |
| ADM-USER-04 | 2 | Detalhe usuário | P1 | Pending |
| ADM-USER-05 | 2 | Link Stripe | P1 | Pending |
| ADM-USER-06 | 2 | 404 usuário | P1 | Pending |
| ADM-USER-07 | 2 | Toggle early adopter | P2 | Pending |
| ADM-USER-08 | 2 | Sync assinatura user | P2 | Pending |
| ADM-MATCH-01 | 3 | Listagem partidas | P2 | Pending |
| ADM-MATCH-02 | 3 | Filtros partidas | P2 | Pending |
| ADM-MATCH-03 | 3 | Menu partidas | P2 | Pending |
| ADM-MATCH-04 | 3 | Detalhe partida | P2 | Pending |
| ADM-MATCH-05 | 3 | Timeline status | P2 | Pending |
| ADM-MATCH-06 | 3 | Cancelar partida | P3 | Pending |
| ADM-BILL-01 | 4 | Métricas billing | P1 | Pending |
| ADM-BILL-02 | 4 | Action billing metrics | P1 | Pending |
| ADM-BILL-03 | 4 | Listagem assinaturas | P1 | Pending |
| ADM-BILL-04 | 4 | Link Stripe billing | P1 | Pending |
| ADM-BILL-05 | 4 | Sync assinatura | P2 | Pending |
| ADM-GROUP-01 | 5 | Métricas grupo | P2 | Pending |
| ADM-GROUP-02 | 5 | Tabs convites/pedidos | P2 | Pending |
| ADM-GROUP-03 | 5 | Ocultar partidas pagas | P2 | Pending |
| ADM-GROUP-04 | 5 | Moderação pedidos | P3 | Pending |
| ADM-GROW-01 | 6 | Métricas crescimento | P3 | Pending |
| ADM-GROW-02 | 6 | Read-only fase 1 | P3 | Pending |
| ADM-MOD-01 | 7 | Métricas moderação | P3 | Pending |
| ADM-MOD-02 | 7 | Punições cross-grupo | P3 | Pending |
| ADM-MOD-03 | 7 | Feedbacks existentes | P3 | Pending |
| ADM-TUT-01 | 8 | CRUD tutorial | P3 | Pending |
| ADM-TUT-02 | 8 | Auth tutorial admin | P3 | Pending |
| ADM-TUT-03 | 8 | Drop-off por passo | P3 | Pending |
| ADM-ANN-01 | 9 | Gráfico views | P4 | Pending |
| ADM-ANN-02 | 9 | Filtros novidades | P4 | Pending |
| ADM-SEARCH-01 | 10 | Busca Cmd+K | P4 | Pending |
| ADM-SEARCH-02 | 10 | Limitar resultados | P4 | Pending |

**Coverage:** 44 requisitos totais, 44 mapeados para design/tasks, 0 unmapped

---

## Success Criteria

Quando o projeto estiver completo, o admin deve responder:

| Pergunta | Onde | Requisitos |
|----------|------|------------|
| A plataforma está crescendo? | Dashboard | ADM-DASH-01, ADM-DASH-02 |
| Estamos ganhando dinheiro? | Billing | ADM-BILL-01, ADM-BILL-03 |
| Os usuários estão engajados? | Dashboard + Partidas | ADM-DASH-01, ADM-MATCH-01 |
| O onboarding funciona? | Tutorial | ADM-TUT-03 |
| Há problemas operacionais? | Dashboard alertas + Billing | ADM-DASH-03, ADM-BILL-01 |
| Quais grupos precisam de atenção? | Grupos v2 | ADM-GROUP-01 |
| O crescimento é orgânico? | Growth | ADM-GROW-01 |

---

## Priorização e Dependências

```
Epic 0 (Fundação) — P0
  ├── Epic 1 (Dashboard v2) — P1
  ├── Epic 2 (Usuários) — P1
  │     └── Epic 4 (Billing) — P1 (detalhe user referencia assinatura)
  ├── Epic 3 (Partidas) — P2
  ├── Epic 5 (Grupos v2) — P2
  ├── Epic 6 (Crescimento) — P3
  ├── Epic 7 (Moderação) — P3
  ├── Epic 8 (Tutorial CRUD) — P3
  ├── Epic 9 (Novidades) — P4
  └── Epic 10 (Busca global) — P4 (depende de 2, 3, 5)
```

**Ordem sugerida de implementação:** Epic 0 → Epic 2 + Epic 1 + Epic 4 (paralelo) → Epic 3 + Epic 5 → Epic 6 + Epic 7 + Epic 8 → Epic 9 + Epic 10
