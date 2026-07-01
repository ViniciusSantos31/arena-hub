# Arena Hub — Roadmap

## Em andamento

| Feature | Spec | Design | Tasks | Status |
|---------|------|--------|-------|--------|
| Planos de usuário | ✅ | ✅ | ✅ | Execute concluído; validação sandbox pendente |
| Admin Dashboard | ✅ | ✅ | ✅ | Especificação criada; aguardando implementação |

---

## Admin Dashboard — Épicos

Priorização conforme `.specs/features/admin-dashboard/spec.md`.

| Prioridade | Epic | Descrição | Requisitos |
|------------|------|-----------|------------|
| **P0** | Epic 0 — Fundação | `assertAdmin()`, componentes base, correções | ADM-FOUND-01–07 |
| **P1** | Epic 2 — Usuários | Substituir mock, listagem + detalhe | ADM-USER-01–06 |
| **P1** | Epic 1 — Dashboard v2 | KPIs saúde, alertas, período | ADM-DASH-01–04 |
| **P1** | Epic 4 — Billing | MRR, assinaturas, links Stripe | ADM-BILL-01–04 |
| **P2** | Epic 3 — Partidas | Listagem global, detalhe | ADM-MATCH-01–05 |
| **P2** | Epic 5 — Grupos v2 | Métricas, tabs convites/pedidos | ADM-GROUP-01–03 |
| **P3** | Epic 6 — Crescimento | Analytics aquisição | ADM-GROW-01–02 |
| **P3** | Epic 7 — Moderação | Qualidade comunidade | ADM-MOD-01–03 |
| **P3** | Epic 8 — Tutorial CRUD | Gestão conteúdo + drop-off | ADM-TUT-01–03 |
| **P4** | Epic 9 — Novidades | Melhorias incrementais | ADM-ANN-01–02 |
| **P4** | Epic 10 — Busca global | Cmd+K cross-entity | ADM-SEARCH-01–02 |

### Dependências

```
Epic 0 → [Epic 1, 2, 3, 4, 5, 6, 7, 8] em paralelo (após fundação)
Epic 2 → Epic 4 (detalhe user referencia assinatura)
Epics 2, 3, 5 → Epic 10 (busca global)
```

### Tasks (40 total)

Ver `.specs/features/admin-dashboard/tasks.md` — Phase 0 (T1–T9) bloqueia todo o restante.

---

## Backlog futuro (fora do escopo admin atual)

- Multi-admin / RBAC no banco
- Impersonação de usuário
- Ban/suspensão de conta global
- Telemetria externa (PostHog, Mixpanel)
- Métricas de partidas pagas / Stripe Connect / GMV transacional
- Middleware dedicado para `/admin`

---

## Concluído

| Feature | Data |
|---------|------|
| Especificação planos de usuário | 2026-06-25 |
| Implementação planos (T0–T33) | 2026-06-25 |
| Especificação admin dashboard | 2026-07-01 |
