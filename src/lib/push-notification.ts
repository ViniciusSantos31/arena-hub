// lib/push-notifications.ts
import { db } from "@/db";
import { pushSubscriptionsTable } from "@/db/schema/subscription";
import { eq, inArray } from "drizzle-orm";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:" + process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string; // URL para abrir ao clicar na notificação
  tag?: string; // Agrupa notificações do mesmo tipo (evita spam)
}

// ─── Função base de envio ─────────────────────────────────────────────────────

async function sendToUsers(userIds: string[], payload: NotificationPayload) {
  if (userIds.length === 0) return;

  const subscriptions = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(inArray(pushSubscriptionsTable.userId, userIds));

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ ...payload, vibrate: [100, 50, 100] }), // Exemplo de padrão de vibração
      ),
    ),
  );

  // Remove subscriptions inválidas (usuário removeu permissão no dispositivo)
  const expiredEndpoints = subscriptions
    .filter((_, i) => {
      const result = results[i];
      return (
        result.status === "rejected" &&
        (result.reason?.statusCode === 410 || result.reason?.statusCode === 404)
      );
    })
    .map((sub) => sub.endpoint);

  if (expiredEndpoints.length > 0) {
    await Promise.all(
      expiredEndpoints.map((endpoint) =>
        db
          .delete(pushSubscriptionsTable)
          .where(eq(pushSubscriptionsTable.endpoint, endpoint)),
      ),
    );
  }
}

// ─── Templates de notificação ─────────────────────────────────────────────────

// 1. Nova solicitação de ingresso em grupo
//    → Envia somente para moderadores e owner do grupo
export async function notifyNewJoinRequest({
  groupName,
  requesterName,
  groupCode,
  moderatorIds,
}: {
  groupName: string;
  requesterName: string;
  groupCode: string;
  moderatorIds: string[]; // IDs dos moderadores + owner do grupo
}) {
  await sendToUsers(moderatorIds, {
    title: "📋 Nova solicitação de ingresso",
    body: `${requesterName} quer entrar no grupo "${groupName}"`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    url: `/group/${groupCode}/members/request`,
    tag: `join-request-${groupCode}`,
  });
}

// 2. Nova partida criada no grupo
//    → Envia para todos os membros do grupo
export async function notifyNewMatch({
  groupName,
  matchDate,
  groupCode,
  matchId,
  memberIds,
}: {
  groupName: string;
  matchDate: string; // ex: "Sábado, 15/02 às 19h"
  groupCode: string;
  matchId: string;
  memberIds: string[];
}) {
  await sendToUsers(memberIds, {
    title: "⚽ Nova partida criada!",
    body: `${groupName} tem uma nova partida: ${matchDate}`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    url: `/group/${groupCode}/matches/${matchId}`,
    tag: `new-match-${matchId}`,
  });
}

// Status que disparam notificação
export const NOTIFIABLE_STATUSES = [
  "closed_registration",
  "cancelled",
  "team_sorted",
];
export type NotifiableStatus = (typeof NOTIFIABLE_STATUSES)[number];

export function isNotifiableStatus(status: string): status is NotifiableStatus {
  return NOTIFIABLE_STATUSES.includes(status as NotifiableStatus);
}

// 3. Atualização de status da partida
//    → Envia somente para usuários que fazem parte da partida
export async function notifyMatchStatusUpdate({
  groupName,
  matchDate,
  newStatus,
  groupCode,
  matchId,
  participantIds,
}: {
  groupName: string;
  matchDate: string;
  newStatus: NotifiableStatus;
  groupCode: string;
  matchId: string;
  participantIds: string[];
}) {
  const statusMessages: Record<
    NotifiableStatus,
    { emoji: string; text: string }
  > = {
    cancelled: { emoji: "❌", text: "foi cancelada" },
    closed_registration: { emoji: "🔒", text: "teve as inscrições fechadas" },
    team_sorted: { emoji: "🎲", text: "teve os times sorteados" },
  };

  const { emoji, text } = statusMessages[newStatus];

  await sendToUsers(participantIds, {
    title: `${emoji} Partida ${text}`,
    body: `A partida de ${matchDate} no ${groupName} ${text}`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    url: `/group/${groupCode}/matches/${matchId}`,
    tag: `match-status-${matchId}`,
  });
}

// 4. Sorteio de times realizado
//    → Envia somente para usuários que fazem parte da partida
export async function notifyTeamDraw({
  groupName,
  matchDate,
  groupCode,
  matchId,
  participantIds,
}: {
  groupName: string;
  matchDate: string;
  groupCode: string;
  matchId: string;
  participantIds: string[];
}) {
  await sendToUsers(participantIds, {
    title: "🎲 Times sorteados!",
    body: `Os times da partida de ${matchDate} no ${groupName} foram sorteados`,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    url: `/group/${groupCode}/matches/${matchId}`,
    tag: `team-draw-${matchId}`,
  });
}
