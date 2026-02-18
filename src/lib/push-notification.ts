// lib/push-notifications.ts
import { db } from "@/db";
import { pushSubscriptionsTable } from "@/db/schema/subscription";
import { messaging } from "./firebase-admin";
// import { pushSubscriptions } from '@/db/schema/push-subscriptions'
import { eq, inArray } from "drizzle-orm";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

// Status que disparam notificação
export const NOTIFIABLE_STATUSES = [
  "closed_registration",
  "cancelled",
  "team_sorted",
] as const;
export type NotifiableStatus = (typeof NOTIFIABLE_STATUSES)[number];

export function isNotifiableStatus(status: string): status is NotifiableStatus {
  return NOTIFIABLE_STATUSES.includes(status as NotifiableStatus);
}

// ─── Função base de envio ─────────────────────────────────────────────────────

async function sendToUsers(userIds: string[], payload: NotificationPayload) {
  if (userIds.length === 0) return;

  const subscriptions = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(inArray(pushSubscriptionsTable.userId, userIds));

  console.log(`[Push] Enviando para ${subscriptions.length} subscription(s)`);

  // FCM precisa do token que está no final do endpoint
  const tokens = subscriptions
    .map((sub) => {
      // Extrai o token do endpoint
      // Formato: https://fcm.googleapis.com/fcm/send/TOKEN
      // Ou: https://web.push.apple.com/TOKEN (iOS via FCM também usa esse padrão quando configurado)
      const parts = sub.endpoint.split("/");
      return parts[parts.length - 1];
    })
    .filter((token) => token && token.length > 0);

  if (tokens.length === 0) {
    console.log("[Push] Nenhum token válido encontrado");
    return;
  }

  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        image: payload.icon,
      },
      data: {
        url: payload.url ?? "/",
        tag: payload.tag ?? "",
      },
      webpush: {
        notification: {
          icon: payload.icon ?? "/icons/icon-192x192.png",
          badge: payload.badge ?? "/icons/icon-192x192.png",
          tag: payload.tag,
        },
        fcmOptions: {
          link: payload.url ?? "/",
        },
      },
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(`[Push] Sucesso: ${response.successCount}/${tokens.length}`);

    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`[Push] Falha no token ${idx}:`, resp.error);
          failedTokens.push(tokens[idx]);
        }
      });

      // Remove tokens inválidos (expired ou not registered)
      const invalidEndpoints = subscriptions
        .filter((sub) => {
          const token = sub.endpoint.split("/").pop();
          return token && failedTokens.includes(token);
        })
        .map((sub) => sub.endpoint);

      if (invalidEndpoints.length > 0) {
        await Promise.all(
          invalidEndpoints.map((endpoint) =>
            db
              .delete(pushSubscriptionsTable)
              .where(eq(pushSubscriptionsTable.endpoint, endpoint)),
          ),
        );
        console.log(
          `[Push] Removidos ${invalidEndpoints.length} token(s) inválido(s)`,
        );
      }
    }
  } catch (error) {
    console.error("[Push] Erro ao enviar notificações:", error);
  }
}

// ─── Templates de notificação ─────────────────────────────────────────────────

// 1. Nova solicitação de ingresso em grupo
export async function notifyNewJoinRequest({
  groupName,
  requesterName,
  groupCode,
  moderatorIds,
}: {
  groupName: string;
  requesterName: string;
  groupCode: string;
  moderatorIds: string[];
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
export async function notifyNewMatch({
  groupName,
  matchDate,
  groupCode,
  matchId,
  memberIds,
}: {
  groupName: string;
  matchDate: string;
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

// 3. Atualização de status da partida
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
  newStatus: "team_sorted" | "cancelled" | "closed_registration";
  groupCode: string;
  matchId: string;
  participantIds: string[];
}) {
  const statusMessages = {
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
