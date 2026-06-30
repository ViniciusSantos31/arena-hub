# Arena Hub — Visão do Projeto

## Problema

Organizadores de peladas e grupos esportivos precisam de uma plataforma centralizada para gerenciar grupos, partidas, membros e convites — sem depender de grupos de mensagens.

## Visão

O **Arena Hub** é uma PWA para coordenar grupos esportivos com partidas, confirmações, sorteio de times e notificações push.

## Modelo de negócio (em evolução)

- **Beta atual:** acesso gratuito com limite temporário de 2 grupos por usuário.
- **Próximo passo:** planos de assinatura mensal para **criação de grupos**, com limites por tier (grupos, membros, links de convite).
- **Participação em grupos:** permanece gratuita — plano exigido apenas para criar/ser dono de grupos.
- **Early adopters:** proprietários de grupos existentes antes do lançamento podem criar até **2 grupos** sem assinatura; o 3º exige plano.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Drizzle ORM, PostgreSQL (Neon), Better Auth (plugin `organization`), Stripe (Connect para partidas pagas; Billing para assinaturas), Firebase/FCM, PWA (Serwist).

## Estado atual relevante

| Área | Situação |
|------|----------|
| Criação de grupos | `upsertGroup` via Better Auth `createOrganization`, sem verificação de plano |
| Limite de grupos | Hardcoded: bloqueio após 2 grupos (`GroupLimitDialog` + `UpgradePlanDialog` placeholder) |
| Links de convite | Sem limite por plano; permissão por role (`group:links`) |
| Membros | `organization.maxPlayers` configurável (2–100 no form); sem cap por plano |
| Stripe | Integrado para partidas pagas (Connect + Checkout one-time); webhooks em `/api/stripe/webhooks` |
| Assinaturas | **Não implementado** — `subscription.ts` atual é push notifications (FCM), não billing |
