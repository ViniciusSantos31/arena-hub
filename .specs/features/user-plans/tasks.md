# Planos de Usuário — Tasks

**Design**: `.specs/features/user-plans/design.md`  
**Spec**: `.specs/features/user-plans/spec.md`  
**Status**: Draft

> **Nota sobre testes:** o projeto não possui `TESTING.md` nem suite automatizada. Gates usam `npm run lint` (quick) e `npm run build` (full). Validação funcional via Stripe sandbox na T33.

---

## Execution Plan

### Phase 0: Pré-requisitos (manual + env)

```
T0 (manual)     T1
                  ↓
```

### Phase 1: Foundation — Schema (Sequential)

```
T1 → T2 → T3 → T4 → T5 → T6
```

### Phase 2: Domínio `user-plan` (Sequential)

```
T7 → T8 → T9 → T10 → T11
```

### Phase 3: Stripe Billing (Sequential com ramos)

```
T12 → T13 → T14 ─┐
                  ├→ T16 → T17
T12 → T15 ────────┘
```

### Phase 4: Server Actions (Parallel após T14/T15)

```
T14,T15 done:
  ├── T18 [P]
  ├── T19 [P]
  └── T20 [P]
```

### Phase 5: Enforcement nas actions (Parallel)

```
T11,T13 done:
  ├── T21 [P]
  ├── T22 [P]
  ├── T23 [P]
  ├── T24 [P]
  └── T25 [P]
```

### Phase 6: UI (Sequential com paralelo inicial)

```
T7 done:
  T26 [P] ──→ T27 → T28 → T29

T18,T19,T20 done:
  T30 → T31

T27 done:
  T32
```

### Phase 7: Validação

```
T17,T21–T32 done → T33
```

---

## Task Breakdown

### T0: Configurar Stripe Dashboard (manual)

**What**: Criar Products/Prices mensais em BRL, configurar Customer Portal e eventos de webhook.  
**Where**: Stripe Dashboard (externo)  
**Depends on**: None  
**Reuses**: Conta Stripe já usada em partidas pagas  
**Requirements**: PLAN-03, PLAN-05, PLAN-13, PLAN-16

**Tools**:
- MCP: `plugin-stripe-stripe` (consulta)
- Skill: `stripe-best-practices`

**Done when**:
- [ ] 3 Prices criados (Básico R$5, Intermediário R$15, Premium R$50)
- [ ] Price IDs copiados para uso em T1
- [ ] Customer Portal habilitado (cancelamento, troca de plano, cartão)
- [ ] Webhook endpoint apontando para `/api/stripe/webhooks` com eventos `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

**Tests**: none  
**Gate**: manual

**Verify**: Price IDs válidos no modo test/live conforme ambiente.

---

### T1: Variáveis de ambiente

**What**: Documentar novas env vars em `.env.example`.  
**Where**: `.env.example`  
**Depends on**: T0 (Price IDs reais)  
**Reuses**: Padrão existente de `STRIPE_SECRET_KEY`  
**Requirements**: PLAN-05, PLAN-20

**Done when**:
- [ ] `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_INTERMEDIATE`, `STRIPE_PRICE_PREMIUM` documentados
- [ ] `PLAN_LAUNCH_DATE`, `PLAN_GRACE_PERIOD_DAYS` documentados
- [ ] Comentários em português explicando cada variável

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T2: Schema `user-billing`

**What**: Criar tabelas `user_billing_subscription` e `stripe_processed_event` com enums.  
**Where**: `src/db/schema/user-billing.ts`  
**Depends on**: None  
**Reuses**: Padrão Drizzle em `src/db/schema/auth.ts`  
**Requirements**: PLAN-20, PLAN-17

**Done when**:
- [ ] Enums `plan_tier` e `billing_subscription_status` definidos
- [ ] Tabelas com FKs e índices únicos (`stripe_subscription_id`)
- [ ] Tipos exportados (`UserBillingSubscription`, etc.)

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add user billing subscription schema`

---

### T3: Estender schema `user`

**What**: Adicionar `isEarlyAdopter`, `earlyAdopterGrantedAt`, `stripeBillingCustomerId`.  
**Where**: `src/db/schema/user.ts`  
**Depends on**: None  
**Reuses**: Colunas existentes em `usersTable`  
**Requirements**: PLAN-09, PLAN-20

**Done when**:
- [ ] Três colunas adicionadas com defaults corretos
- [ ] Sem breaking changes em relations existentes

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add early adopter and stripe customer fields to user`

---

### T4: Exportar schema no index

**What**: Registrar `user-billing` em `src/db/schema/index.ts`.  
**Where**: `src/db/schema/index.ts`  
**Depends on**: T2, T3  
**Reuses**: Spread pattern existente  
**Requirements**: PLAN-20

**Done when**:
- [ ] `user-billing` importado e exportado
- [ ] Drizzle kit reconhece novos schemas

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T5: Aplicar migração no banco

**What**: Executar `drizzle-kit push` (ou generate + migrate conforme fluxo do time).  
**Where**: `drizzle/` (output gerado)  
**Depends on**: T4  
**Reuses**: `drizzle.config.ts`  
**Requirements**: PLAN-20

**Done when**:
- [ ] Tabelas criadas no PostgreSQL de dev
- [ ] Colunas novas em `user` existem
- [ ] Sem erros de push

**Tests**: none  
**Gate**: manual — inspecionar DB ou `drizzle-kit push` exit 0

**Verify**:
```bash
npx drizzle-kit push
```

---

### T6: Script de concessão early adopters

**What**: Script one-shot que marca owners existentes como early adopters.  
**Where**: `src/db/scripts/grant-early-adopters.ts`  
**Depends on**: T5  
**Reuses**: Padrão `src/db/seed/populate.ts` (`tsx`)  
**Requirements**: PLAN-09, PLAN-10

**Done when**:
- [ ] Script lê `PLAN_LAUNCH_DATE` e atualiza `is_early_adopter = true` para owners elegíveis
- [ ] Idempotente (rodar 2x não duplica efeito)
- [ ] Log de quantos usuários foram marcados

**Tests**: none  
**Gate**: manual — dry-run ou execução em dev

**Verify**:
```bash
npx tsx src/db/scripts/grant-early-adopters.ts
```

**Commit**: `feat(billing): add early adopter grant script`

---

### T7: Tipos e constantes de plano

**What**: `PlanTier`, `PlanLimits`, `UserPlanContext`, `PLAN_LIMITS`, `EARLY_ADOPTER_FREE_GROUPS`.  
**Where**: `src/lib/user-plan/types.ts`, `src/lib/user-plan/plan-tiers.ts`  
**Depends on**: None  
**Reuses**: Valores de `design.md`  
**Requirements**: PLAN-06, PLAN-10

**Done when**:
- [ ] Tipos exportados conforme design
- [ ] Constantes batem com spec (1/3/10 grupos, 30/60/∞ membros, 3/6/∞ links)

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add plan tier types and limits`

---

### T8: Classe `PlanLimitError`

**What**: Erro tipado com `code: PlanErrorCode` e `meta` opcional.  
**Where**: `src/lib/user-plan/plan-limit-error.ts`  
**Depends on**: T7  
**Reuses**: Padrão de `Error` customizado  
**Requirements**: PLAN-01, PLAN-02, PLAN-21

**Done when**:
- [ ] Classe exportada com todos os códigos do design
- [ ] Helper `isPlanLimitError(err): err is PlanLimitError` (opcional mas útil)

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T9: Queries de contagem

**What**: `countOwnedGroups`, `countActiveInviteLinksForOwner`, `getOrganizationOwnerUserId`.  
**Where**: `src/lib/user-plan/queries.ts`  
**Depends on**: T5  
**Reuses**: `sql\`count(*)\`` de `preview.ts`; join `member` + `organization_invite_link`  
**Requirements**: PLAN-18, PLAN-08

**Done when**:
- [ ] `countOwnedGroups` filtra `role = 'owner'`
- [ ] Links ativos = `revokedAt IS NULL`, somados nos grupos do owner
- [ ] `getOrganizationOwnerUserId` retorna userId do owner

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add user plan count queries`

---

### T10: `getUserPlanContext`

**What**: Resolver contexto completo — assinatura, early adopter, limites efetivos, uso.  
**Where**: `src/lib/user-plan/get-user-plan-context.ts`  
**Depends on**: T7, T9, T13 (apenas `isSubscriptionEffectivelyActive` — ver nota)

**Nota de dependência**: T13 define `isSubscriptionEffectivelyActive`. Implementar função mínima em T10 ou extrair para `src/lib/user-plan/subscription-status.ts` em T10 e reutilizar em T13. **Escolha do design:** criar `subscription-status.ts` em T10; T13 importa de lá.

**What (ajustado)**: Incluir `subscription-status.ts` com `isSubscriptionEffectivelyActive` + `getUserPlanContext` + `resolveGroupLimit` + `shouldEnforcePlanMemberAndLinkLimits`.  
**Where**: `src/lib/user-plan/subscription-status.ts`, `src/lib/user-plan/get-user-plan-context.ts`  
**Depends on**: T7, T9  
**Requirements**: PLAN-06, PLAN-09, PLAN-19

**Done when**:
- [ ] `resolveGroupLimit`: plano ativo → tier; EA sem plano → 2; senão → 0
- [ ] `shouldEnforcePlanMemberAndLinkLimits`: true só com assinatura efetiva
- [ ] `past_due` respeita `gracePeriodEndsAt` / `PLAN_GRACE_PERIOD_DAYS`
- [ ] `getUserPlanContext` retorna `limits` e `usage` preenchidos

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add user plan context resolver`

---

### T11: Assertions de limite

**What**: `assertCanCreateGroup`, `assertCanSetMaxPlayers`, `assertCanCreateInviteLink`, `getEffectiveMemberCapForOrganization`.  
**Where**: `src/lib/user-plan/assertions.ts`  
**Depends on**: T10  
**Reuses**: `PlanLimitError`  
**Requirements**: PLAN-01, PLAN-02, PLAN-06, PLAN-07, PLAN-08, PLAN-10, PLAN-21

**Done when**:
- [ ] `assertCanCreateGroup` distingue `PLAN_REQUIRED`, `GROUP_LIMIT`, `EARLY_ADOPTER_GROUP_LIMIT`
- [ ] EA com 2 grupos sem plano → `EARLY_ADOPTER_GROUP_LIMIT`
- [ ] `assertCanCreateInviteLink` só aplica cap com assinatura ativa
- [ ] `getEffectiveMemberCapForOrganization` retorna `min(maxPlayers, planCap)`

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add plan limit assertions`

---

### T12: Mapeamento Price ID ↔ tier

**What**: `priceIdToPlanTier` e `planTierToPriceId`.  
**Where**: `src/lib/stripe-billing/map-price-to-tier.ts`  
**Depends on**: T1  
**Reuses**: Env vars  
**Requirements**: PLAN-03, PLAN-05

**Done when**:
- [ ] Mapeamento bidirecional para os 3 tiers
- [ ] Retorna `null` / lança erro para price desconhecido

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T13: Sync assinatura Stripe → DB

**What**: `syncSubscriptionFromStripe` faz upsert em `user_billing_subscription`.  
**Where**: `src/lib/stripe-billing/sync-subscription.ts`  
**Depends on**: T5, T12, T10 (`isSubscriptionEffectivelyActive` já em `subscription-status.ts`)  
**Reuses**: Padrão `apply-paid-checkout-session.ts`  
**Requirements**: PLAN-04, PLAN-16, PLAN-19

**Done when**:
- [ ] Extrai `planTier` do price da subscription
- [ ] Persiste status, período, `cancelAtPeriodEnd`, `gracePeriodEndsAt`
- [ ] Atualiza `user.stripeBillingCustomerId` se necessário

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): sync stripe subscription to database`

---

### T14: Checkout Session de assinatura

**What**: `createSubscriptionCheckout({ userId, email, planTier })`.  
**Where**: `src/lib/stripe-billing/create-subscription-checkout.ts`  
**Depends on**: T12, T5  
**Reuses**: `createMatchCheckoutSession`, `requireAppUrl`, `stripe`  
**Requirements**: PLAN-03, PLAN-04

**Done when**:
- [ ] `mode: 'subscription'` sem `payment_method_types`
- [ ] Metadata `type: 'platform_subscription'`, `userId`, `planTier`
- [ ] Reutiliza ou cria `stripeBillingCustomerId`
- [ ] Retorna `{ url }`

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add subscription checkout session`

---

### T15: Billing Portal Session

**What**: `createBillingPortalSession(userId)`.  
**Where**: `src/lib/stripe-billing/create-billing-portal-session.ts`  
**Depends on**: T5  
**Reuses**: `requireAppUrl`  
**Requirements**: PLAN-13

**Done when**:
- [ ] Exige `stripeBillingCustomerId` existente
- [ ] `return_url` → `/profile?tab=subscription`
- [ ] Erro claro se usuário nunca assinou

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add stripe billing portal session`

---

### T16: Handlers de webhook billing

**What**: `handleStripeBillingWebhook` com idempotência e dispatch por tipo.  
**Where**: `src/lib/stripe-billing/webhooks.ts`  
**Depends on**: T13, T2  
**Reuses**: `stripe_processed_event`, padrão early-return  
**Requirements**: PLAN-16, PLAN-17

**Done when**:
- [ ] Handlers: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
- [ ] Ignora eventos sem `metadata.type === 'platform_subscription'` (ou equivalente)
- [ ] Idempotência via `event.id`
- [ ] `payment_failed` seta `past_due` + grace period

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add stripe billing webhook handlers`

---

### T17: Integrar webhooks na rota existente

**What**: Chamar `handleStripeBillingWebhook` antes dos handlers de partidas pagas.  
**Where**: `src/app/api/stripe/webhooks/route.ts`  
**Depends on**: T16  
**Reuses**: Rota existente  
**Requirements**: PLAN-16

**Done when**:
- [ ] Billing handler executado primeiro
- [ ] Handlers de match/Connect inalterados em comportamento
- [ ] Build passa

**Tests**: none  
**Gate**: full — `npm run build`

**Commit**: `feat(billing): wire billing webhooks into stripe route`

---

### T18: Action `createPlanCheckoutSession` [P]

**What**: Server action que inicia checkout para tier selecionado.  
**Where**: `src/actions/user-plan/create-checkout-session.ts`  
**Depends on**: T14  
**Reuses**: `actionClient`, `auth.api.getSession`  
**Requirements**: PLAN-03

**Done when**:
- [ ] Input: `planTier` enum
- [ ] Retorna `{ url }` ou erro
- [ ] Sessão autenticada obrigatória

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T19: Action `createBillingPortalSession` [P]

**What**: Server action que retorna URL do Customer Portal.  
**Where**: `src/actions/user-plan/create-portal-session.ts`  
**Depends on**: T15  
**Reuses**: `actionClient`  
**Requirements**: PLAN-13

**Done when**:
- [ ] Retorna `{ url }` para assinantes com customer ID
- [ ] Erro amigável para não-assinantes

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T20: Action `getSubscriptionSummary` [P]

**What**: Dados agregados para UI do perfil e gates.  
**Where**: `src/actions/user-plan/get-subscription-summary.ts`  
**Depends on**: T10  
**Reuses**: `getUserPlanContext`  
**Requirements**: PLAN-12

**Done when**:
- [ ] Expõe plano, status, renovação, uso grupos/links, flag early adopter
- [ ] Serializável para client components

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add user plan server actions`

---

### T21: Gate em `upsertGroup` (criação) [P]

**What**: Chamar `assertCanCreateGroup` e `assertCanSetMaxPlayers` antes de criar grupo.  
**Where**: `src/actions/group/create.ts`  
**Depends on**: T11  
**Reuses**: Fluxo `createOrganization` existente  
**Requirements**: PLAN-01, PLAN-02, PLAN-06, PLAN-07

**Done when**:
- [ ] Criação (`!id`) valida plano e limites
- [ ] Edição (`id`) valida `maxPlayers` contra plano do owner
- [ ] Erros propagam `PlanLimitError.code` para o client

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T22: Gate em `createInviteLink` [P]

**What**: `assertCanCreateInviteLink` antes do insert.  
**Where**: `src/actions/invite-links/create.ts`  
**Depends on**: T11  
**Requirements**: PLAN-08

**Done when**:
- [ ] Bloqueia quando limite total de links ativos atingido
- [ ] Sem bloqueio para EA sem plano (beta)

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T23: Cap de membros em `previewInviteLink` [P]

**What**: Usar `getEffectiveMemberCapForOrganization` no check de `group-full`.  
**Where**: `src/actions/invite-links/preview.ts`  
**Depends on**: T11  
**Requirements**: PLAN-07, PLAN-11

**Done when**:
- [ ] Compara `membersCount` com cap efetivo (não só `org.maxPlayers` quando plano ativo)
- [ ] Participantes sem plano não são bloqueados por falta de plano próprio

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T24: Cap de membros em `reviewJoinRequest` [P]

**What**: Mesma validação ao aprovar solicitação de entrada.  
**Where**: `src/actions/group/review-join-request.ts`  
**Depends on**: T11  
**Requirements**: PLAN-07

**Done when**:
- [ ] Aprovação bloqueada se cap do owner atingido
- [ ] Mensagem de erro clara

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T25: Validar `maxPlayers` no formulário de config [P]

**What**: Feedback client-side alinhado ao limite do plano do owner.  
**Where**: `src/app/(protected)/group/[code]/settings/_components/config-access-form.tsx`  
**Depends on**: T20  
**Reuses**: `getSubscriptionSummary` ou prop do server parent  
**Requirements**: PLAN-07

**Done when**:
- [ ] Input `maxPlayers` com `max` dinâmico baseado no plano
- [ ] Server-side já validado em T21 (defesa em profundidade)

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): enforce plan limits in group and invite actions`

---

### T26: Componente `PlanTierCard` [P]

**What**: Card de plano com preço, limites e botão Assinar.  
**Where**: `src/app/(protected)/_components/plan-tier-card.tsx`  
**Depends on**: T7  
**Reuses**: `Button`, `Card` do shadcn  
**Requirements**: PLAN-14, PLAN-15

**Done when**:
- [ ] Props: `tier`, `priceLabel`, limites, `onSelect`, `loading`
- [ ] Textos em português
- [ ] Estado loading no botão

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T27: Componente `PlanPickerDialog`

**What**: Modal comparativo com variantes `plan_required`, `group_limit`, `early_adopter_limit`, `upgrade`.  
**Where**: `src/app/(protected)/_components/plan-picker-dialog.tsx`  
**Depends on**: T26, T18  
**Reuses**: `ResponsiveDialog`  
**Requirements**: PLAN-14, PLAN-15, PLAN-21

**Done when**:
- [ ] Grid com 3 `PlanTierCard`
- [ ] Variante `early_adopter_limit` exibe copy de `context.md`
- [ ] Clique em Assinar chama `createPlanCheckoutSession` e redireciona

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add plan picker dialog and tier cards`

---

### T28: Componente `CreateGroupGate`

**What**: Server component que bloqueia ou libera criação de grupo.  
**Where**: `src/app/(protected)/group/create/_components/create-group-gate.tsx`  
**Depends on**: T10, T27  
**Reuses**: `getUserPlanContext`, `PlanPickerDialog`  
**Requirements**: PLAN-01, PLAN-09, PLAN-10, PLAN-21

**Done when**:
- [ ] Usa `countOwnedGroups` + `resolveGroupLimit` (não `listOrganizations`)
- [ ] Abre dialog correto por código de bloqueio
- [ ] Renderiza `children` quando permitido

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T29: Integrar `CreateGroupGate` no layout

**What**: Substituir `GroupLimitDialog` por `CreateGroupGate`.  
**Where**: `src/app/(protected)/group/create/layout.tsx`  
**Depends on**: T28  
**Reuses**: `PageContainer` existente  
**Requirements**: PLAN-01, PLAN-18

**Done when**:
- [ ] `GroupLimitDialog` removido do layout
- [ ] `listOrganizations` removido se não usado

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): gate group creation by user plan`

---

### T30: Componente `SubscriptionSection`

**What**: Seção/aba de assinatura no perfil.  
**Where**: `src/app/(protected)/profile/_components/subscription-section.tsx`  
**Depends on**: T20, T19  
**Reuses**: `Badge`, `Progress`, padrão de cards do perfil  
**Requirements**: PLAN-12

**Done when**:
- [ ] Estados: early adopter, assinante ativo, sem plano
- [ ] Exibe uso vs limites (grupos, links)
- [ ] Botão "Gerenciar assinatura" → portal
- [ ] CTA assinar para não-assinantes

**Tests**: none  
**Gate**: quick — `npm run lint`

---

### T31: Aba Assinatura no perfil

**What**: Adicionar tab "Assinatura" em `/profile`.  
**Where**: `src/app/(protected)/profile/page.tsx`  
**Depends on**: T30  
**Reuses**: Padrão de tabs existente  
**Requirements**: PLAN-12

**Done when**:
- [ ] Tab `subscription` com ícone
- [ ] Suporta `?tab=subscription` na URL (retorno do checkout)
- [ ] `SubscriptionSection` renderizado

**Tests**: none  
**Gate**: quick — `npm run lint`

**Commit**: `feat(billing): add subscription section to profile`

---

### T32: Remover placeholder beta

**What**: Deprecar `UpgradePlanDialog` e `GroupLimitDialog`; redirecionar usos para `PlanPickerDialog`.  
**Where**: `upgrade-plan-dialog.tsx`, `group-limit-dialog.tsx`, grep por imports  
**Depends on**: T27  
**Requirements**: PLAN-14

**Done when**:
- [ ] Nenhum texto "plataforma em fase de testes / 2 grupos" restante
- [ ] Imports atualizados ou arquivos removidos
- [ ] Build passa

**Tests**: none  
**Gate**: full — `npm run build`

**Commit**: `chore(billing): remove beta group limit placeholder`

---

### T33: Validação sandbox Stripe

**What**: Checklist manual end-to-end em ambiente de teste.  
**Where**: N/A (validação)  
**Depends on**: T17, T21–T32, T0  
**Requirements**: Todos PLAN-*

**Done when**:
- [ ] Usuário novo → bloqueado em criar grupo → checkout Básico → cria 1 grupo
- [ ] Early adopter → 2 grupos sem pagar → 3º mostra mensagem EA → Intermediário → 3º OK
- [ ] Limite links (Básico: 3) e membros (30) enforced
- [ ] Portal cancela assinatura → webhook atualiza status
- [ ] Participante sem plano entra em grupo via convite
- [ ] `stripe trigger` ou CLI para `customer.subscription.updated`

**Tests**: none  
**Gate**: manual + full — `npm run build`

**Verify**:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
# Fluxos manuais no browser
npm run build
```

---

## Parallel Execution Map

```
Phase 1:  T1 → T2 → T3 → T4 → T5 → T6

Phase 2:  T7 → T8 → T9 → T10 → T11

Phase 3:  T12 → T13 → T14
          T12 → T15
          T13,T14,T15 → T16 → T17

Phase 4:  T18, T19, T20  (paralelo)

Phase 5:  T21, T22, T23, T24, T25  (paralelo)

Phase 6:  T26 (paralelo com T18-25 se T7 done)
          T27 → T28 → T29
          T30 → T31
          T32 (após T27)

Phase 7:  T33
```

---

## Requirement Traceability

| Req ID | Tasks |
|--------|-------|
| PLAN-01 | T21, T28, T29 |
| PLAN-02 | T21, T8 |
| PLAN-03 | T0, T14, T18 |
| PLAN-04 | T13, T16, T17 |
| PLAN-05 | T0, T1, T12 |
| PLAN-06 | T7, T10, T11, T21 |
| PLAN-07 | T11, T21, T23, T24, T25 |
| PLAN-08 | T9, T11, T22 |
| PLAN-09 | T3, T6, T10, T28 |
| PLAN-10 | T7, T10, T11, T28 |
| PLAN-11 | T23 (sem gate em join) |
| PLAN-12 | T20, T30, T31 |
| PLAN-13 | T0, T15, T19, T30 |
| PLAN-14 | T26, T27, T32 |
| PLAN-15 | T26, T27 |
| PLAN-16 | T0, T16, T17 |
| PLAN-17 | T2, T16 |
| PLAN-18 | T9, T28, T29 |
| PLAN-19 | T10, T13, T11 |
| PLAN-20 | T1–T5 |
| PLAN-21 | T8, T11, T27, T28 |

**Coverage:** 21/21 requisitos mapeados ✅

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T2 | 1 schema file | ✅ Granular |
| T7 | 2 arquivos coesos (types + tiers) | ✅ OK |
| T10 | 2 arquivos coesos (status + context) | ✅ OK |
| T16 | 1 módulo webhook | ✅ Granular |
| T21 | 1 action modify | ✅ Granular |
| T27 | 1 dialog component | ✅ Granular |
| T32 | cleanup multi-file | ✅ OK (coeso) |
| T33 | validação E2E | ✅ OK (fase final) |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T0 | None | Phase 0 standalone | ✅ |
| T1 | T0 | T0 → T1 | ✅ |
| T2 | None | Phase 1 start | ✅ |
| T3 | None | Parallel start Phase 1 | ✅ |
| T4 | T2, T3 | T2,T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | None | Phase 2 start | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T5 | After T5 (Phase 2 needs DB) | ✅ |
| T10 | T7, T9 | T7,T9 → T10 | ✅ |
| T11 | T10 | T10 → T11 | ✅ |
| T12 | T1 | Phase 3 after T1 | ✅ |
| T13 | T5, T12, T10 | T12 → T13 | ✅ |
| T14 | T12, T5 | T12 → T14 | ✅ |
| T15 | T5 | T5 → T15 | ✅ |
| T16 | T13, T2 | T13,T14,T15 → T16 | ✅ |
| T17 | T16 | T16 → T17 | ✅ |
| T18 | T14 | Parallel Phase 4 | ✅ |
| T19 | T15 | Parallel Phase 4 | ✅ |
| T20 | T10 | Parallel Phase 4 | ✅ |
| T21 | T11 | Parallel Phase 5 | ✅ |
| T22 | T11 | Parallel Phase 5 | ✅ |
| T23 | T11 | Parallel Phase 5 | ✅ |
| T24 | T11 | Parallel Phase 5 | ✅ |
| T25 | T20 | Parallel Phase 5 | ✅ |
| T26 | T7 | Parallel Phase 6 | ✅ |
| T27 | T26, T18 | T26,T18 → T27 | ✅ |
| T28 | T10, T27 | T27 → T28 | ✅ |
| T29 | T28 | T28 → T29 | ✅ |
| T30 | T20, T19 | T20,T19 → T30 | ✅ |
| T31 | T30 | T30 → T31 | ✅ |
| T32 | T27 | After T27 | ✅ |
| T33 | T17, T21–T32, T0 | Phase 7 | ✅ |

---

## Test Co-location Validation

> Projeto sem `TESTING.md` e sem testes automatizados. Todas as tasks usam `Tests: none` com gate `lint` ou `build`. Validação manual concentrada em T33.

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|------------|-----------------|-----------|--------|
| T2–T32 | lib/actions/UI | none (sem matrix) | none | ✅ OK |
| T33 | E2E manual | none | manual checklist | ✅ OK |

---

## Ferramentas recomendadas por fase

| Fase | MCP / Skill |
|------|-------------|
| T0, T12–T17 | `stripe-best-practices`, MCP Stripe |
| T5, T6 | Shell (`drizzle-kit push`, `tsx`) |
| T21–T25 | Exploração codebase |
| T33 | Stripe CLI, browser |

---

## Próximo passo

Aprovar tasks → **Execute** começando por **T0 + T1** (Stripe Dashboard + env), depois **T2–T6** (schema).
