# Estado do Projeto

## Decisões

| Data | Decisão |
|------|---------|
| 2026-06-25 | Especificação de planos de usuário criada em `.specs/features/user-plans/spec.md` |
| 2026-06-25 | Planos mensais via Stripe Checkout + Customer Portal |
| 2026-06-25 | Plano exigido apenas para criar grupos; participação permanece gratuita |
| 2026-06-25 | Assunções A1–A3 e A5 confirmadas (cancelamento, downgrade, upgrade, 0 grupos sem plano) |
| 2026-06-25 | Early adopter: isenção na criação de **até 2 grupos** sem assinatura; 3º exige plano com mensagem dedicada (ver `context.md`) |
| 2026-06-25 | Design concluído em `.specs/features/user-plans/design.md` |
| 2026-07-01 | Especificação admin dashboard criada em `.specs/features/admin-dashboard/` (spec, design, tasks) |
| 2026-07-01 | Escopo admin exclui partidas pagas, Stripe Connect e GMV transacional |
| 2026-07-01 | Priorização admin: P0 Fundação → P1 Usuários/Dashboard/Billing → P2 Partidas/Grupos |

## Pendências

- [x] Confirmar assunções A1–A4 na spec
- [x] Fase Design para planos de usuário
- [ ] Definir `PLAN_LAUNCH_DATE` antes do deploy
- [ ] Criar Products/Prices no Stripe Dashboard (BRL, mensal)
- [x] Fase Tasks para planos de usuário
- [x] Execute (T0–T33) — implementação concluída; validação sandbox (T33) pendente manual
- [ ] Execute admin dashboard — iniciar por Epic 0 (T1–T9)
- [ ] Aprovar spec/design admin antes de implementação

## Lições

- `listOrganizations` retorna todos os grupos do usuário, não só owned — limite atual de 2 grupos em `create/layout.tsx` está conceitualmente incorreto para planos.
- `src/db/schema/subscription.ts` é push notifications (FCM), não billing — usar nome distinto para schema de assinatura (ex.: `user-subscription.ts`).
- Early adopter com 2 grupos isentos + plano Básico (1 grupo) fica acima do limite do plano para novas criações — grupos existentes permanecem (A1).
