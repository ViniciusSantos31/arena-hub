# Admin Dashboard — Tasks

**Design**: `.specs/features/admin-dashboard/design.md`
**Status**: Draft

> **Nota:** `.specs/codebase/TESTING.md` não existe. Gate padrão: `npm run lint` + `npm run build`. Tests: none até definição de estratégia de testes.

---

## Execution Plan

### Phase 0: Fundação (Sequential — bloqueia tudo)

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9
```

### Phase 1: P1 Core (Parallel após Phase 0)

```
         ┌→ T10 → T11 → T12 → T13  (Dashboard v2)
T9 ──────┼→ T14 → T15 → T16 → T17 → T20  (Usuários)
         └→ T21 → T22 → T23 → T24  (Billing)
```

### Phase 2: P2 Operacional (Parallel após Phase 1)

```
         ┌→ T25 → T26 → T27 → T28  (Partidas)
T13,T17 ─┼→ T29 → T30 → T31  (Grupos v2)
T24 ─────┘
```

### Phase 3: P3 Analytics & CRUD (Parallel após Phase 2)

```
         ┌→ T32 → T33  (Crescimento)
T31 ─────┼→ T34 → T35  (Moderação)
         └→ T36 → T37 → T38  (Tutorial CRUD)
```

### Phase 4: P4 Polish (Sequential, após Phase 3)

```
T38 → T39 → T40  (Novidades incremental + Busca global)
```

---

## Task Breakdown

### Phase 0: Fundação

---

### T1: Criar `assertAdmin()`

**What**: Implementar verificação centralizada de acesso admin
**Where**: `src/lib/admin/assert-admin.ts`
**Depends on**: None
**Reuses**: Lógica de `src/app/admin/layout.tsx`, `src/actions/admin/overview.ts`
**Requirement**: ADM-FOUND-01, ADM-FOUND-02

**Done when**:
- [ ] `assertAdmin()` retorna `AdminSession` para e-mail admin
- [ ] Lança erro para sessão ausente ou e-mail não-admin
- [ ] Exporta `isAdminEmail()` helper
- [ ] Gate: `npm run lint` passa

**Tests**: none
**Gate**: lint

---

### T2: Aplicar `assertAdmin()` em actions admin existentes

**What**: Substituir verificação inline em todas as server actions admin
**Where**: `src/actions/admin/**/*.ts`, `src/actions/feature-announcements/admin.ts`, `src/actions/tutorial/admin.ts`
**Depends on**: T1
**Reuses**: `assertAdmin()`
**Requirement**: ADM-FOUND-01, ADM-FOUND-03

**Done when**:
- [ ] `overview.ts`, `resume.ts`, `feedback.ts`, `groups/list.ts`, `groups/detail.ts`, `tutorial.ts` usam `assertAdmin()`
- [ ] `feature-announcements/admin.ts` usa `assertAdmin()`
- [ ] `tutorial/admin.ts` usa `assertAdmin()`
- [ ] Nenhuma action admin com verificação duplicada inline

**Tests**: none
**Gate**: lint

---

### T3: Refatorar layout admin para `assertAdmin()`

**What**: Layout delega auth para helper centralizado
**Where**: `src/app/admin/layout.tsx`
**Depends on**: T1
**Reuses**: `assertAdmin()`
**Requirement**: ADM-FOUND-02

**Done when**:
- [ ] Layout usa `assertAdmin()` ou wrapper equivalente
- [ ] Redirect `/` para não-admin mantido

**Tests**: none
**Gate**: lint

---

### T4: Unificar `_componentes` → `_components`

**What**: Migrar pasta e atualizar imports
**Where**: `src/app/admin/_componentes/` → `src/app/admin/_components/groups/`
**Depends on**: None
**Reuses**: N/A
**Requirement**: ADM-FOUND-04

**Done when**:
- [ ] Pasta `_componentes` removida
- [ ] Todos os imports atualizados
- [ ] Build passa

**Tests**: none
**Gate**: build

---

### T5: Corrigir público/privado no `GroupAdminCard`

**What**: Exibir badge correto conforme `organization.private`
**Where**: `src/app/admin/_components/groups/group-admin-card.tsx`
**Depends on**: T4
**Reuses**: Campo `private` do schema
**Requirement**: ADM-FOUND-05

**Done when**:
- [ ] Grupos públicos exibem "Público"
- [ ] Grupos privados exibem "Privado"

**Tests**: none
**Gate**: lint

---

### T6: Otimizar queries de série temporal

**What**: Substituir filter em memória por `GROUP BY` SQL
**Where**: `src/actions/admin/overview.ts`, `src/actions/admin/resume.ts`
**Depends on**: T2
**Reuses**: Queries existentes
**Requirement**: ADM-FOUND-06

**Done when**:
- [ ] `activitySeries` usa agregação SQL por dia
- [ ] Tutorial resume idem
- [ ] Sem `findMany` + filter JS para séries temporais

**Tests**: none
**Gate**: lint

---

### T7: Criar `AdminDataTable` [P]

**What**: Componente de tabela paginada reutilizável
**Where**: `src/app/admin/_components/admin-data-table.tsx`
**Depends on**: T4
**Reuses**: shadcn Table, TanStack Table
**Requirement**: ADM-FOUND-07

**Done when**:
- [ ] Suporta paginação server-side (page, pageSize, pageCount)
- [ ] Props tipadas e documentadas
- [ ] Estado loading

**Tests**: none
**Gate**: lint

---

### T8: Criar `AdminDateRangeFilter` [P]

**What**: Seletor de período com presets 7/30/90 dias
**Where**: `src/app/admin/_components/admin-date-range-filter.tsx`
**Depends on**: T4
**Reuses**: shadcn Calendar/Popover
**Requirement**: ADM-FOUND-07, ADM-DASH-02

**Done when**:
- [ ] Presets 7, 30, 90 dias funcionais
- [ ] Callback `onChange` com range tipado

**Tests**: none
**Gate**: lint

---

### T9: Criar `AdminEmptyState` [P]

**What**: Componente de estado vazio padronizado
**Where**: `src/app/admin/_components/admin-empty-state.tsx`
**Depends on**: T4
**Reuses**: shadcn patterns
**Requirement**: ADM-FOUND-07

**Done when**:
- [ ] Props: title, description, optional action
- [ ] Usado em pelo menos um lugar (placeholder ok)

**Tests**: none
**Gate**: lint

---

### Phase 1: Dashboard v2, Usuários, Billing

---

### T10: Implementar `adminExecutiveMetrics`

**What**: Action com KPIs de saúde da plataforma
**Where**: `src/actions/admin/overview.ts` (ou `executive-metrics.ts`)
**Depends on**: T2, T6
**Reuses**: `adminOverview`, `PLAN_TIER_PRICES`, schemas billing/feedback/push
**Requirement**: ADM-DASH-01, ADM-DASH-04

**Done when**:
- [ ] Retorna `AdminExecutiveMetricsData` tipado
- [ ] Calcula: activeUsers d7/d30, activeGroups, matchCompletionRate, subscribers, MRR, earlyAdopters, pastDue, pendingFeedbacks, pushSubscriptions, avgMembersPerGroup
- [ ] `assertAdmin()` no início

**Tests**: none
**Gate**: lint

---

### T11: Seletor de período no dashboard

**What**: Integrar `AdminDateRangeFilter` no dashboard
**Where**: `src/app/admin/dashboard/page.tsx`, componente client wrapper
**Depends on**: T8, T10
**Reuses**: `AdminDateRangeFilter`
**Requirement**: ADM-DASH-02

**Done when**:
- [ ] Admin pode selecionar 7/30/90 dias
- [ ] Métricas temporais atualizam conforme período

**Tests**: none
**Gate**: lint

---

### T12: Cards de alerta no dashboard

**What**: Alertas para feedbacks pendentes e assinaturas past_due
**Where**: `src/app/admin/dashboard/_components/admin-alerts.tsx`
**Depends on**: T10
**Reuses**: `MetricCard`, links para `/admin/feedbacks`, `/admin/billing`
**Requirement**: ADM-DASH-03

**Done when**:
- [ ] Cards aparecem quando count > 0
- [ ] Links navegam para módulos corretos

**Tests**: none
**Gate**: lint

---

### T13: Integrar dashboard v2

**What**: Page do dashboard exibe novos KPIs + alertas + período
**Where**: `src/app/admin/dashboard/page.tsx`
**Depends on**: T11, T12
**Reuses**: `MetricCard`, `OverviewActivityChart`
**Requirement**: ADM-DASH-01

**Done when**:
- [ ] Todos os KPIs da spec visíveis
- [ ] Layout responsivo mantido
- [ ] Build passa

**Tests**: none
**Gate**: build

---

### T14: Implementar `listAdminUsers`

**What**: Action de listagem paginada com filtros
**Where**: `src/actions/admin/users/list.ts`
**Depends on**: T2
**Reuses**: `usersTable`, `user_billing_subscription`, `member`, `player`, tutorial progress
**Requirement**: ADM-USER-01, ADM-USER-02, ADM-USER-03

**Done when**:
- [ ] Input: page, pageSize, search, filtros (plano, status, early adopter, verificado, período)
- [ ] Output: `PaginatedResponse<AdminUserListItem>`
- [ ] Queries com LIMIT/OFFSET

**Tests**: none
**Gate**: lint

---

### T15: Página de listagem de usuários

**What**: Substituir mock por tabela real com filtros
**Where**: `src/app/admin/users/page.tsx`, `_components/users-table.tsx`
**Depends on**: T7, T9, T14
**Reuses**: `AdminDataTable`, `AdminEmptyState`, `listAdminUsers`
**Requirement**: ADM-USER-01, ADM-USER-02

**Done when**:
- [ ] Mock removido
- [ ] Filtros funcionais
- [ ] Paginação server-side

**Tests**: none
**Gate**: build

---

### T16: Implementar `getAdminUserDetail`

**What**: Action de detalhe do usuário
**Where**: `src/actions/admin/users/detail.ts`
**Depends on**: T2
**Reuses**: `getUserPlanContext`, schemas user/member/match/feedback/tutorial
**Requirement**: ADM-USER-04, ADM-USER-05, ADM-USER-06

**Done when**:
- [ ] Retorna perfil, grupos, assinatura, tutorial, feedbacks, partidas recentes
- [ ] Inclui `stripeCustomerId` / link Stripe quando existir
- [ ] Retorna null para ID inexistente

**Tests**: none
**Gate**: lint

---

### T17: Página de detalhe do usuário

**What**: UI read-only do perfil completo
**Where**: `src/app/admin/users/[id]/page.tsx`
**Depends on**: T16
**Reuses**: `getAdminUserDetail`, cards existentes
**Requirement**: ADM-USER-04, ADM-USER-05

**Done when**:
- [ ] Seções: perfil, grupos, assinatura, tutorial, feedbacks, partidas
- [ ] Link Stripe abre nova aba
- [ ] `notFound()` para ID inválido

**Tests**: none
**Gate**: build

---

### T18: Toggle early adopter [P]

**What**: Action + UI para conceder/revogar early adopter
**Where**: `src/actions/admin/users/set-early-adopter.ts`, botão no detail page
**Depends on**: T17
**Reuses**: `usersTable.isEarlyAdopter`
**Requirement**: ADM-USER-07

**Done when**:
- [ ] Toggle persiste no banco
- [ ] Toast de feedback

**Tests**: none
**Gate**: lint

---

### T19: Sync assinatura no detalhe de user [P]

**What**: Botão para forçar sync via Stripe
**Where**: `src/app/admin/users/[id]/`, reutilizar `sync-subscription.ts`
**Depends on**: T17
**Reuses**: `src/lib/stripe-billing/sync-subscription.ts`
**Requirement**: ADM-USER-08

**Done when**:
- [ ] Botão aciona sync
- [ ] UI atualiza após sucesso

**Tests**: none
**Gate**: lint

---

### T20: Adicionar Usuários ao menu admin

**What**: Item de navegação para `/admin/users`
**Where**: `src/app/admin/_components/admin-nav-items.tsx`
**Depends on**: T15
**Reuses**: Padrão nav existente
**Requirement**: ADM-USER-01

**Done when**:
- [ ] Item "Usuários" visível no sidebar
- [ ] Highlight ativo na rota

**Tests**: none
**Gate**: lint

---

### T21: Implementar `adminBillingMetrics`

**What**: Action com métricas de receita recorrente
**Where**: `src/actions/admin/billing/metrics.ts`
**Depends on**: T2
**Reuses**: `user_billing_subscription`, `PLAN_TIER_PRICES`, `usersTable.isEarlyAdopter`
**Requirement**: ADM-BILL-01, ADM-BILL-02

**Done when**:
- [ ] Retorna `AdminBillingMetricsData`
- [ ] MRR = soma tier × preço para active/trialing

**Tests**: none
**Gate**: lint

---

### T22: Implementar `listAdminSubscriptions`

**What**: Listagem paginada de assinaturas
**Where**: `src/actions/admin/billing/subscriptions.ts`
**Depends on**: T2
**Reuses**: `user_billing_subscription` JOIN `user`
**Requirement**: ADM-BILL-03, ADM-BILL-04

**Done when**:
- [ ] Colunas conforme design
- [ ] Paginação server-side
- [ ] `stripeSubscriptionId` para link Stripe

**Tests**: none
**Gate**: lint

---

### T23: Página `/admin/billing`

**What**: UI de métricas + listagem de assinaturas
**Where**: `src/app/admin/billing/page.tsx`
**Depends on**: T7, T9, T21, T22
**Reuses**: `AdminDataTable`, `MetricCard`
**Requirement**: ADM-BILL-01, ADM-BILL-03

**Done when**:
- [ ] Métricas no topo
- [ ] Tabela de assinaturas abaixo
- [ ] Links Stripe funcionais

**Tests**: none
**Gate**: build

---

### T24: Adicionar Billing ao menu admin

**What**: Item de navegação para `/admin/billing`
**Where**: `src/app/admin/_components/admin-nav-items.tsx`
**Depends on**: T23
**Requirement**: ADM-BILL-01

**Done when**:
- [ ] Item "Billing" no sidebar

**Tests**: none
**Gate**: lint

---

### Phase 2: Partidas e Grupos v2

---

### T25: Implementar `listAdminMatches`

**What**: Action de listagem + métricas de partidas
**Where**: `src/actions/admin/matches/list.ts`
**Depends on**: T2
**Reuses**: `matchesTable`, `player`, `organization`
**Requirement**: ADM-MATCH-01, ADM-MATCH-02

**Done when**:
- [ ] Métricas: por status, esporte/categoria, preenchimento, cancelamento, tempo médio, top grupos
- [ ] Listagem paginada com filtros

**Tests**: none
**Gate**: lint

---

### T26: Página `/admin/matches`

**What**: Substituir mock por dados reais
**Where**: `src/app/admin/matches/page.tsx`
**Depends on**: T7, T9, T25
**Reuses**: `AdminDataTable`
**Requirement**: ADM-MATCH-01, ADM-MATCH-03

**Done when**:
- [ ] Mock removido
- [ ] Métricas + tabela funcionais

**Tests**: none
**Gate**: build

---

### T27: Implementar `getAdminMatchDetail`

**What**: Action de detalhe da partida
**Where**: `src/actions/admin/matches/detail.ts`
**Depends on**: T2
**Reuses**: `matchesTable`, `player`, padrão `groups/detail.ts`
**Requirement**: ADM-MATCH-04, ADM-MATCH-05

**Done when**:
- [ ] Retorna partida, jogadores, link grupo
- [ ] Status atual sempre; timeline se disponível

**Tests**: none
**Gate**: lint

---

### T28: Página `/admin/matches/[id]` + menu Partidas

**What**: Detalhe da partida e item no nav
**Where**: `src/app/admin/matches/[id]/page.tsx`, `admin-nav-items.tsx`
**Depends on**: T27
**Requirement**: ADM-MATCH-04, ADM-MATCH-03

**Done when**:
- [ ] Detalhe funcional
- [ ] Item "Partidas" descomentado no menu

**Tests**: none
**Gate**: build

---

### T29: Enriquecer métricas de grupo

**What**: Adicionar KPIs no card e detalhe
**Where**: `src/actions/admin/groups/detail.ts`, componentes de grupo
**Depends on**: T5
**Reuses**: `requests`, `invite-link`, `punishment`, `match`
**Requirement**: ADM-GROUP-01

**Done when**:
- [ ] Métricas: ocupação, partidas 30d, conclusão, pedidos, links, punições

**Tests**: none
**Gate**: lint

---

### T30: Tabs Convites e Pedidos no detalhe de grupo

**What**: Novas tabs read-only
**Where**: `src/app/admin/_components/groups/detail/group-admin-detail-view.tsx`
**Depends on**: T29
**Reuses**: Schemas invite/request
**Requirement**: ADM-GROUP-02

**Done when**:
- [ ] Tab Convites com links e usos
- [ ] Tab Pedidos (só grupos privados)

**Tests**: none
**Gate**: build

---

### T31: Ocultar toggle partidas pagas

**What**: Remover ou ocultar `admin-group-paid-matches-feature-switch`
**Where**: `src/app/admin/_components/groups/detail/`
**Depends on**: T30
**Requirement**: ADM-GROUP-03

**Done when**:
- [ ] Toggle não visível no admin
- [ ] Action `set-paid-matches-feature` pode permanecer (não exposta)

**Tests**: none
**Gate**: lint

---

### Phase 3: Crescimento, Moderação, Tutorial

---

### T32: Implementar `adminGrowthMetrics`

**What**: Action com métricas de aquisição
**Where**: `src/actions/admin/growth/metrics.ts`
**Depends on**: T2
**Reuses**: `invite-link`, `direct-invite`, `requests`, `account`
**Requirement**: ADM-GROW-01, ADM-GROW-02

**Done when**:
- [ ] Todas as métricas da spec retornadas
- [ ] Read-only

**Tests**: none
**Gate**: lint

---

### T33: Página `/admin/growth`

**What**: UI de analytics de crescimento
**Where**: `src/app/admin/growth/page.tsx`
**Depends on**: T32
**Reuses**: `MetricCard`, `AdminChart`
**Requirement**: ADM-GROW-01

**Done when**:
- [ ] Métricas exibidas
- [ ] Item no menu (opcional fase 2)

**Tests**: none
**Gate**: build

---

### T34: Implementar métricas de moderação

**What**: Action centralizada de qualidade
**Where**: `src/actions/admin/moderation/metrics.ts`
**Depends on**: T2
**Reuses**: `feedback`, `punishment`, `member`, `match`
**Requirement**: ADM-MOD-01, ADM-MOD-02

**Done when**:
- [ ] Rating médio, pendentes, punições, suspensos, grupos alto cancelamento
- [ ] Listagem cross-grupo punições read-only

**Tests**: none
**Gate**: lint

---

### T35: Página `/admin/moderation`

**What**: UI de moderação centralizada
**Where**: `src/app/admin/moderation/page.tsx`
**Depends on**: T34
**Reuses**: Link para feedbacks existente
**Requirement**: ADM-MOD-01, ADM-MOD-03

**Done when**:
- [ ] Métricas + listagem punições
- [ ] Link rápido para `/admin/feedbacks`

**Tests**: none
**Gate**: build

---

### T36: Proteger e conectar tutorial admin actions

**What**: `assertAdmin()` + wiring para CRUD
**Where**: `src/actions/tutorial/admin.ts`
**Depends on**: T2
**Reuses**: Schemas tutorial
**Requirement**: ADM-TUT-02

**Done when**:
- [ ] Todas as actions protegidas
- [ ] CRUD funcional via action

**Tests**: none
**Gate**: lint

---

### T37: Página `/admin/tutorial/content`

**What**: UI CRUD de seções e passos
**Where**: `src/app/admin/tutorial/content/page.tsx`
**Depends on**: T36
**Reuses**: Actions tutorial admin
**Requirement**: ADM-TUT-01

**Done when**:
- [ ] Criar, editar, excluir seções e passos
- [ ] Link no menu tutorial ou sub-nav

**Tests**: none
**Gate**: build

---

### T38: Drop-off por passo no tutorial analytics

**What**: Métrica de abandono por passo individual
**Where**: `src/actions/admin/tutorial.ts`, `src/app/admin/tutorial/page.tsx`
**Depends on**: T2
**Reuses**: `user_tutorial_progress`, `tutorial_steps`
**Requirement**: ADM-TUT-03

**Done when**:
- [ ] Tabela/gráfico por passo além de por seção

**Tests**: none
**Gate**: lint

---

### Phase 4: Polish

---

### T39: Melhorias incrementais em novidades [P]

**What**: Gráfico views, filtro requiredAction, preview responsivo
**Where**: `src/app/admin/announcements/`
**Depends on**: T38
**Reuses**: `FeatureAnnouncementsAdmin`
**Requirement**: ADM-ANN-01, ADM-ANN-02

**Done when**:
- [ ] Pelo menos 1 melhoria implementada (priorizar gráfico views)
- [ ] CRUD existente intacto

**Tests**: none
**Gate**: lint

---

### T40: Busca global admin (Cmd+K)

**What**: Command palette para busca cross-entity
**Where**: `src/actions/admin/search/global-search.ts`, `admin-search-command.tsx`
**Depends on**: T17, T28, T30
**Reuses**: shadcn Command
**Requirement**: ADM-SEARCH-01, ADM-SEARCH-02

**Done when**:
- [ ] Cmd+K abre busca
- [ ] Busca email, nome, código grupo, título partida
- [ ] Top 10 por categoria, links para detalhes

**Tests**: none
**Gate**: build

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: assertAdmin | 1 módulo | ✅ Granular |
| T2: Aplicar auth | múltiplos arquivos, 1 conceito | ✅ OK (coeso) |
| T7-T9: Componentes base | 1 componente cada | ✅ Granular |
| T15: Página users | page + table component | ✅ OK |
| T13: Dashboard integração | 1 page | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T1 | None | Início Phase 0 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T10 | T2, T6 | T9 → T10 | ✅ |
| T14 | T2 | T9 → T14 | ✅ |
| T15 | T7, T9, T14 | T14 → T15 | ✅ |
| T25 | T2 | Phase 2 parallel | ✅ |
| T40 | T17, T28, T30 | Phase 4 after T38 | ✅ |

---

## Parallel Execution Map

```
Phase 0 (Sequential):
  T1 → T2 → T3 → T4 → T5 → T6
  T4 → T7, T8, T9 [P]

Phase 1 (Parallel after T9):
  Branch A: T10 → T11 → T12 → T13
  Branch B: T14 → T15; T16 → T17 → T18, T19 [P]; T20
  Branch C: T21 → T22 → T23 → T24

Phase 2 (Parallel after Phase 1):
  Branch A: T25 → T26 → T27 → T28
  Branch B: T29 → T30 → T31

Phase 3 (Parallel after Phase 2):
  T32 → T33 | T34 → T35 | T36 → T37 → T38

Phase 4 (Sequential):
  T39 [P] → T40
```

**Commit sugerido por task:** `feat(admin): [descrição curta]`
