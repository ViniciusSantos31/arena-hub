# Planos de Usuário — Especificação

## Problem Statement

O Arena Hub está saindo da fase beta gratuita e precisa monetizar a **criação e gestão de grupos** sem bloquear a participação de jogadores. Hoje existe apenas um limite hardcoded de 2 grupos com diálogo placeholder; não há integração de assinatura, nem enforcement de limites de membros ou links de convite por plano.

## Goals

- [ ] Usuários só podem **criar grupos** com assinatura ativa (ou isenção de early adopter).
- [ ] Três planos mensais com limites claros de grupos, membros e links de convite.
- [ ] Checkout e gestão de assinatura via **Stripe** (Checkout + Customer Portal).
- [ ] Painel do usuário exibe assinatura atual e link para gerenciar no Stripe.
- [ ] Proprietários de grupos pré-existentes (early adopters) criam até **2 grupos** sem pagar; o 3º exige plano.
- [ ] Participar de grupos permanece **gratuito** para todos.

## Out of Scope

| Feature | Motivo |
|---------|--------|
| Cobrança por participação em grupos | Explicitamente fora — só criação exige plano |
| Planos anuais | Apenas mensal nesta fase |
| Trial gratuito | Não solicitado |
| Múltiplas assinaturas simultâneas por usuário | Um plano ativo por vez |
| Billing de partidas pagas (Stripe Connect) | Já existe separadamente; não misturar com planos de plataforma |
| Admin UI para criar/editar planos | Planos criados no Stripe Dashboard |
| Cupons/descontos | Pode ser configurado no Stripe depois, fora do escopo inicial |
| Faturamento via PIX/boleto fora do Stripe | Checkout Stripe apenas |

---

## Definições

### Plano ativo

Assinatura Stripe com status `active` ou `trialing`, vinculada ao usuário, com período vigente.

### Grupo próprio

Organização onde o usuário tem role `owner` na tabela `member`.

### Early adopter (isenção parcial)

Usuário que era `owner` de pelo menos um grupo **antes da data de lançamento da monetização** (`PLAN_LAUNCH_DATE`).

- **Sem assinatura ativa:** pode criar até **2 grupos** como owner, sem pagar. Limites de membros e links por tier **não se aplicam** nesses grupos (comportamento herdado da beta).
- **A partir do 3º grupo:** exige assinatura ativa com tier que permita o total desejado de grupos.
- **Com assinatura ativa:** limites do plano contratado aplicam-se ao **total** de grupos próprios (a isenção de 2 grupos não se soma ao limite do plano).

Ao tentar criar o 3º grupo sem plano, o sistema informa que o usuário é Early Adopter isento na criação de dois grupos, mas que para criar o terceiro precisa assinar um plano.

> Decisões detalhadas em [`context.md`](./context.md).

### Limites por plano

| Plano | Preço/mês | Grupos (owner) | Membros (por grupo) | Links de convite (total) |
|-------|-----------|----------------|---------------------|--------------------------|
| **Básico** | R$ 5,00 | 1 | 30 | 3 |
| **Intermediário** | R$ 15,00 | 3 | 60 | 6 |
| **Premium** | R$ 50,00 | 10 | Ilimitado | Ilimitado |

**Interpretação dos limites (assunção documentada):**

- **Grupos:** conta apenas grupos onde o usuário é `owner` (não inclui grupos em que apenas participa).
- **Membros:** limite por grupo — máximo de membros ativos (`member` + convites pendentes de aprovação, se aplicável) e teto de `maxPlayers` configurável no grupo.
- **Links de convite:** soma de links **não revogados** em todos os grupos próprios do usuário.

### Assunções de produto ✅ Confirmadas

| # | Decisão |
|---|---------|
| A1 | Cancelamento mantém grupos existentes; impede criar novos além do permitido sem plano |
| A2 | Downgrade no fim do ciclo de cobrança; até lá mantém limites do plano anterior |
| A3 | Upgrade aplica novos limites imediatamente após confirmação do Stripe |
| A4 | Early adopter: isenção na criação de **até 2 grupos** sem assinatura; 3º grupo exige plano |
| A5 | Usuário sem plano e sem isenção: 0 grupos criáveis |

---

## User Stories

### P1: Bloquear criação de grupo sem plano ⭐ MVP

**User Story**: Como usuário sem assinatura, quero entender que preciso de um plano para criar um grupo, para que eu possa assinar e começar a organizar minha pelada.

**Why P1**: Core do modelo de negócio — sem este gate, os planos não têm efeito.

**Acceptance Criteria**:

1. WHEN usuário autenticado sem plano ativo e sem isenção de early adopter acessa `/group/create` THEN sistema SHALL exibir fluxo de upgrade (não o formulário de criação).
2. WHEN usuário sem plano ativo tenta executar `upsertGroup` sem `id` (criação) THEN sistema SHALL rejeitar com erro claro (`PLAN_REQUIRED`).
3. WHEN usuário com plano ativo cria grupo THEN sistema SHALL permitir criação normalmente.
4. WHEN early adopter sem assinatura possui menos de 2 grupos como owner e cria grupo THEN sistema SHALL permitir sem assinatura.
5. WHEN early adopter sem assinatura já possui 2 grupos como owner e tenta criar outro THEN sistema SHALL bloquear e exibir mensagem de isenção Early Adopter (2 grupos) + CTA para assinar plano (`EARLY_ADOPTER_GROUP_LIMIT`).
6. WHEN usuário edita grupo existente (`upsertGroup` com `id`) THEN sistema SHALL permitir independentemente do plano (desde que seja owner/admin com permissão).

**Independent Test**: Criar conta nova → tentar criar grupo → ver CTA de planos; assinar plano Básico → criar 1 grupo com sucesso.

---

### P1: Três planos com checkout Stripe ⭐ MVP

**User Story**: Como usuário, quero escolher um plano e pagar via Stripe, para desbloquear a criação de grupos.

**Why P1**: Sem checkout, não há receita nem desbloqueio.

**Acceptance Criteria**:

1. WHEN usuário seleciona um plano (Básico, Intermediário ou Premium) THEN sistema SHALL criar Stripe Checkout Session em modo `subscription` com o Price ID correspondente.
2. WHEN checkout é concluído com sucesso THEN webhook `checkout.session.completed` ou `customer.subscription.created` SHALL persistir assinatura no banco (userId, stripeCustomerId, stripeSubscriptionId, planTier, status, currentPeriodEnd).
3. WHEN pagamento falha ou sessão expira THEN sistema SHALL manter usuário sem plano ativo.
4. WHEN plano é mensal THEN cobrança SHALL recorrer automaticamente a cada ciclo via Stripe Billing.
5. WHEN produtos/preços são criados no Stripe Dashboard THEN sistema SHALL referenciá-los por Price ID via variáveis de ambiente (não hardcoded em código de produção).

**Independent Test**: Fluxo completo sandbox Stripe — selecionar Básico → pagar com cartão teste → retornar ao app → criar grupo.

---

### P1: Enforcement de limites por plano ⭐ MVP

**User Story**: Como plataforma, quero respeitar os limites de cada plano, para que o tier cobrado corresponda ao uso permitido.

**Why P1**: Limites são o diferencial entre os três planos.

**Acceptance Criteria**:

1. WHEN usuário com plano Básico já possui 1 grupo como owner e tenta criar outro THEN sistema SHALL bloquear e exibir mensagem de upgrade.
2. WHEN usuário com plano Intermediário possui 3 grupos como owner THEN sistema SHALL bloquear nova criação.
3. WHEN usuário com plano Premium possui 10 grupos como owner THEN sistema SHALL bloquear nova criação.
4. WHEN owner tenta definir `maxPlayers` acima do limite do plano THEN sistema SHALL rejeitar ou capar no máximo permitido.
5. WHEN grupo atinge limite de membros do plano e novo membro tenta entrar THEN sistema SHALL bloquear entrada (mesmo comportamento de "grupo cheio" existente).
6. WHEN owner tenta criar link de convite e total de links ativos nos grupos próprios atingiu o limite THEN sistema SHALL bloquear com mensagem indicando upgrade ou revogar links existentes.
7. WHEN plano Premium THEN limites de membros e links SHALL ser tratados como ilimitados (sem bloqueio por contagem).

**Independent Test**: Assinar Básico → criar 1 grupo → tentar 2º (falha); criar 3 links (4º falha); adicionar 30º membro OK, 31º bloqueado.

---

### P1: Isenção de early adopters ⭐ MVP

**User Story**: Como proprietário de grupo existente antes do lançamento, quero continuar usando a plataforma sem pagar, para não ser penalizado por ter adotado cedo.

**Why P1**: Requisito explícito de negócio — risco de churn e má vontade se ignorado.

**Acceptance Criteria**:

1. WHEN feature é lançada THEN sistema SHALL marcar usuários que eram `owner` de ≥1 grupo na `PLAN_LAUNCH_DATE` como early adopters (`planExempt: true` ou equivalente).
2. WHEN early adopter sem assinatura possui 0 ou 1 grupo como owner THEN sistema SHALL permitir criação até o 2º grupo sem checkout.
3. WHEN early adopter sem assinatura possui 2 grupos como owner e tenta criar o 3º THEN sistema SHALL bloquear com mensagem: isento na criação de 2 grupos por ser Early Adopter; para o 3º, assinar um plano.
4. WHEN early adopter com assinatura ativa cria grupo THEN sistema SHALL aplicar limites do plano contratado ao total de grupos próprios.
5. WHEN early adopter visualiza painel de assinatura THEN sistema SHALL indicar status "Early Adopter — até 2 grupos sem assinatura" e uso atual (ex.: 2/2 grupos isentos).
6. WHEN novo usuário se registra após lançamento THEN sistema SHALL exigir plano para criar qualquer grupo.

**Independent Test**: Owner pré-lançamento → criar 2 grupos sem pagamento → 3º bloqueado com mensagem Early Adopter → assinar Intermediário → criar 3º com sucesso.

---

### P1: Participação gratuita em grupos ⭐ MVP

**User Story**: Como jogador, quero entrar em grupos sem pagar, para participar das peladas sem barreira.

**Why P1**: Diferencial do produto — monetizar organizadores, não jogadores.

**Acceptance Criteria**:

1. WHEN usuário sem plano aceita convite ou solicita entrada em grupo THEN sistema SHALL permitir normalmente.
2. WHEN usuário sem plano participa de partidas THEN sistema SHALL permitir normalmente.
3. WHEN verificação de plano é executada THEN sistema SHALL aplicar apenas em ações de **criação** de grupo e **limites do owner** (membros/links nos grupos que possui).

**Independent Test**: Usuário sem plano entra via link de convite e confirma presença em partida.

---

### P2: Painel de assinatura no perfil

**User Story**: Como assinante, quero ver meu plano atual e gerenciar minha assinatura no Stripe, para atualizar cartão, cancelar ou trocar de plano.

**Why P2**: Essencial para autonomia do usuário; reduz suporte.

**Acceptance Criteria**:

1. WHEN usuário acessa perfil (`/profile`) THEN sistema SHALL exibir seção "Assinatura" com: nome do plano, status, data de renovação, uso vs. limites (grupos, links).
2. WHEN usuário clica em "Gerenciar assinatura" THEN sistema SHALL abrir Stripe Customer Portal (session criada server-side).
3. WHEN assinatura é cancelada via Portal THEN webhook `customer.subscription.updated/deleted` SHALL atualizar status no banco e aplicar regras de pós-cancelamento (ver A1).
4. WHEN usuário é early adopter sem assinatura THEN seção SHALL mostrar isenção (até 2 grupos), uso atual e CTA para assinar se quiser mais grupos.

**Independent Test**: Assinante vê plano Básico → abre Portal → cancela → status muda para cancelado/agendado.

---

### P2: Página de planos / upgrade

**User Story**: Como usuário interessado em criar grupo, quero comparar os três planos e escolher o melhor para mim.

**Why P2**: Conversão — substitui o `UpgradePlanDialog` placeholder atual.

**Acceptance Criteria**:

1. WHEN usuário sem plano é bloqueado na criação THEN sistema SHALL redirecionar ou exibir modal com os 3 planos, preços e limites.
2. WHEN usuário já tem plano e atingiu limite de tier THEN sistema SHALL sugerir upgrade para tier superior.
3. WHEN usuário clica em "Assinar" em um plano THEN sistema SHALL iniciar Checkout Stripe.
4. WHEN conteúdo é exibido THEN textos SHALL estar em português e preços em BRL (R$).

**Independent Test**: Fluxo de upgrade a partir do bloqueio de criação de grupo.

---

### P3: Sincronização robusta via webhooks

**User Story**: Como plataforma, quero que o estado da assinatura no banco reflita o Stripe em tempo real, para evitar acesso indevido ou bloqueio injusto.

**Why P3**: Confiabilidade em produção.

**Acceptance Criteria**:

1. WHEN evento `customer.subscription.updated` THEN sistema SHALL atualizar planTier, status e currentPeriodEnd.
2. WHEN evento `customer.subscription.deleted` THEN sistema SHALL marcar assinatura como inativa.
3. WHEN evento `invoice.payment_failed` THEN sistema SHALL marcar status `past_due` e aplicar grace period configurável (sugestão: 3 dias) antes de revogar acesso.
4. WHEN webhook recebido THEN sistema SHALL ser idempotente (reprocessar mesmo evento não corrompe dados).

**Independent Test**: Simular eventos via Stripe CLI e verificar estado no banco.

---

## Edge Cases

- WHEN usuário deleta grupo próprio THEN contagem de grupos SHALL diminuir, liberando slot para novo grupo no mesmo plano.
- WHEN usuário revoga link de convite THEN contagem de links ativos SHALL diminuir.
- WHEN owner transfere ownership (se existir no futuro) THEN limites SHALL recalcular para ambos os usuários — **fora de escopo se transferência não existir hoje**.
- WHEN assinatura expira no meio do mês THEN grupos existentes permanecem (A1); criar novo grupo ou exceder limites SHALL bloquear.
- WHEN usuário com 3 grupos no Intermediário faz downgrade para Básico (1 grupo) THEN no fim do ciclo SHALL bloquear criação; grupos existentes permanecem mas usuário não pode criar até estar dentro do limite ou fazer upgrade.
- WHEN `listOrganizations` do Better Auth retorna todos os grupos (incluindo membro) THEN verificação de limite SHALL usar contagem de grupos como **owner**, não `groups.length` (bug atual no `create/layout.tsx`).
- WHEN early adopter possui 2 grupos sem plano e assina Básico (limite 1 grupo) THEN grupos existentes permanecem (A1), mas criação de novos SHALL bloquear até upgrade para tier com capacidade suficiente.
- WHEN early adopter com 1 grupo assina Básico THEN pode criar mais 1 grupo (total 2), alinhado ao limite do Básico.
- WHEN Stripe está indisponível no checkout THEN sistema SHALL exibir erro amigável e permitir retry.
- WHEN mesmo email já tem `stripeCustomerId` THEN reutilizar customer existente no Checkout.

---

## Modelo de dados (proposta)

Nova tabela `user_subscription` (ou campos em `user`):

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userId` | FK → user | Dono da assinatura |
| `stripeCustomerId` | text | `cus_…` |
| `stripeSubscriptionId` | text | `sub_…` |
| `planTier` | enum | `basic` \| `intermediate` \| `premium` |
| `status` | enum | `active` \| `trialing` \| `past_due` \| `canceled` \| `incomplete` |
| `currentPeriodEnd` | timestamp | Fim do ciclo atual |
| `cancelAtPeriodEnd` | boolean | Cancelamento agendado |
| `planExempt` | boolean | Early adopter — em `user` ou flag separada |
| `planExemptGrantedAt` | timestamp | Auditoria |

Variáveis de ambiente:

```
STRIPE_PRICE_BASIC=price_…
STRIPE_PRICE_INTERMEDIATE=price_…
STRIPE_PRICE_PREMIUM=price_…
STRIPE_BILLING_PORTAL_RETURN_URL=…
PLAN_LAUNCH_DATE=2026-XX-XX
```

---

## Integração Stripe (referência)

| Componente | Uso |
|------------|-----|
| Products + Prices | 3 produtos recorrentes mensais em BRL, criados no Dashboard |
| Checkout Session | `mode: 'subscription'`, `line_items: [{ price }]`, `client_reference_id: userId` |
| Customer Portal | `stripe.billingPortal.sessions.create` para gerenciamento |
| Webhooks | `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed` |
| Metadata | `userId`, `planTier` em Subscription e Checkout Session |

> Stripe Connect (partidas pagas) permanece independente — não usar Connect para assinaturas de plataforma.

---

## Impacto no código existente

| Arquivo / área | Mudança |
|----------------|---------|
| `src/app/(protected)/group/create/layout.tsx` | Substituir limite hardcoded `groupsCount < 2` por verificação de plano + limites |
| `src/app/(protected)/_components/upgrade-plan-dialog.tsx` | Substituir placeholder beta por CTA real de planos |
| `src/actions/group/create.ts` | Gate de plano na criação; validar limite de grupos |
| `src/actions/invite-links/create.ts` | Validar limite total de links do owner |
| `src/app/api/stripe/webhooks/route.ts` | Handlers de subscription (separar de partidas pagas) |
| `src/app/(protected)/profile/page.tsx` | Nova aba ou seção "Assinatura" |
| `src/db/schema/` | Nova tabela de assinatura + migration de early adopters |
| `GroupLimitDialog` | Remover lógica beta; usar componente de upgrade por plano |

---

## Requirement Traceability

| Requirement ID | Story | Fase | Status |
|----------------|-------|------|--------|
| PLAN-01 | P1: Bloquear criação sem plano | Tasks | Mapped |
| PLAN-02 | P1: Bloquear criação sem plano | Tasks | Mapped |
| PLAN-03 | P1: Checkout Stripe | Tasks | Mapped |
| PLAN-04 | P1: Checkout Stripe | Tasks | Mapped |
| PLAN-05 | P1: Checkout Stripe | Tasks | Mapped |
| PLAN-06 | P1: Limites — grupos | Tasks | Mapped |
| PLAN-07 | P1: Limites — membros | Tasks | Mapped |
| PLAN-08 | P1: Limites — links | Tasks | Mapped |
| PLAN-09 | P1: Early adopters | Tasks | Mapped |
| PLAN-10 | P1: Early adopters — limite 2 grupos | Tasks | Mapped |
| PLAN-21 | P1: Early adopters — mensagem 3º grupo | Tasks | Mapped |
| PLAN-11 | P1: Participação gratuita | Tasks | Mapped |
| PLAN-12 | P2: Painel assinatura | Tasks | Mapped |
| PLAN-13 | P2: Painel assinatura | Tasks | Mapped |
| PLAN-14 | P2: Página de planos | Tasks | Mapped |
| PLAN-15 | P2: Página de planos | Tasks | Mapped |
| PLAN-16 | P3: Webhooks | Tasks | Mapped |
| PLAN-17 | P3: Webhooks | Tasks | Mapped |
| PLAN-18 | Edge: contagem owner | Tasks | Mapped |
| PLAN-19 | Edge: pós-cancelamento | Tasks | Mapped |
| PLAN-20 | Dados: schema assinatura | Tasks | Mapped |

**Coverage:** 21 requisitos, 21 mapeados para tasks (T0–T33), 0 pendentes

---

## Success Criteria

- [ ] Usuário novo sem plano não consegue criar grupo; após assinar Básico, cria 1 grupo.
- [ ] Limites de membros (30/60/∞) e links (3/6/∞) são enforced em produção.
- [ ] Early adopters criam até 2 grupos sem pagamento; 3º exige plano com mensagem clara.
- [ ] Jogadores sem plano entram em grupos e participam de partidas normalmente.
- [ ] Assinante gerencia assinatura via Stripe Portal a partir do perfil.
- [ ] Webhooks mantêm status sincronizado em cenários de cancelamento e falha de pagamento.
- [ ] Placeholder "plataforma em beta / 2 grupos" removido.

---

## Próximos passos (tlc-spec-driven)

1. ~~Validar assunções A1–A4~~ ✅ Confirmadas — ver [`context.md`](./context.md).
2. ~~**Design**~~ ✅ — ver [`design.md`](./design.md).
3. ~~**Tasks**~~ ✅ — ver [`tasks.md`](./tasks.md).
4. **Execute** — implementação incremental (T0 → T33).
