# Planos de Usuário — Contexto de decisões

Decisões de produto confirmadas em 2026-06-25.

## Assunções confirmadas

| # | Decisão |
|---|---------|
| A1 | Cancelamento mantém grupos existentes; impede criar novos além do permitido sem plano |
| A2 | Downgrade no fim do ciclo de cobrança; até lá mantém limites do plano anterior |
| A3 | Upgrade aplica novos limites imediatamente após confirmação do Stripe |
| A5 | Usuário sem plano e sem isenção: 0 grupos criáveis |

## Early adopter (A4 — decisão final)

**Não** recebe limites equivalentes ao Premium.

| Situação | Comportamento |
|----------|---------------|
| Early adopter **sem** assinatura ativa | Pode criar até **2 grupos** como owner, sem pagar |
| Early adopter tenta criar o **3º grupo** sem plano | Bloquear e exibir mensagem explicando que é isento na criação de 2 grupos por ser Early Adopter, mas que para criar o terceiro precisa assinar um plano |
| Early adopter **com** assinatura ativa | Limites do plano contratado aplicam-se ao total de grupos próprios (não soma +2) |
| Limites de membros/links sem plano | Nos até 2 grupos isentos, não há enforcement por tier de plano (comportamento herdado da beta); após assinar, limites do plano aplicam-se a todos os grupos próprios |

### Mensagem sugerida (3º grupo, sem plano)

> Você é um **Early Adopter** e pode criar até **2 grupos** sem assinatura. Para criar um terceiro grupo, assine um dos nossos planos.

CTA: exibir comparativo de planos / iniciar checkout.

## Critério de elegibilidade

Usuário que era `owner` de ≥1 grupo na `PLAN_LAUNCH_DATE` → `planExempt: true` (flag permanente de early adopter, independente de quantos grupos possui hoje).
