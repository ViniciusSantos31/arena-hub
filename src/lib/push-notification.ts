// lib/push-notifications.ts
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { messaging } from "./firebase-admin";

import { pushSubscriptions } from "@/db/schema/subscription";

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
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));

  console.log(`[Push] Enviando para ${subscriptions.length} subscription(s)`);

  // Tokens FCM são os endpoints salvos no banco
  const tokens = subscriptions
    .map((sub) => {
      // Extrai o token do endpoint
      // Chrome/Android: https://fcm.googleapis.com/fcm/send/TOKEN
      // Safari/iOS: https://web.push.apple.com/TOKEN
      const parts = sub.token.split("/");
      return parts[parts.length - 1];
    })
    .filter((token) => token && token.length > 10);

  if (tokens.length === 0) {
    console.log("[Push] Nenhum token válido encontrado");
    return;
  }

  console.log(
    "[Push] Tokens extraídos:",
    tokens.map((t) => t.substring(0, 20) + "..."),
  );

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
      const invalidTokens: string[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error;
          console.error(`[Push] Falha no token ${idx}:`, error);

          // Só remove tokens que realmente expiraram ou não existem mais
          // Não remove por erros temporários (rate limit, network, etc)
          if (
            error?.code === "messaging/registration-token-not-registered" ||
            error?.code === "messaging/invalid-registration-token"
          ) {
            invalidTokens.push(tokens[idx]);
            console.log(
              `[Push] Token ${idx} marcado para remoção (${error.code})`,
            );
          } else {
            console.log(
              `[Push] Token ${idx} mantido (erro temporário: ${error?.code})`,
            );
          }
        }
      });

      if (invalidTokens.length > 0) {
        const invalidSubscriptions = subscriptions.filter((sub) => {
          const token = sub.token.split("/").pop();
          return token && invalidTokens.includes(token);
        });

        if (invalidSubscriptions.length > 0) {
          await Promise.all(
            invalidSubscriptions.map((sub) =>
              db
                .delete(pushSubscriptions)
                .where(eq(pushSubscriptions.token, sub.token)),
            ),
          );
          console.log(
            `[Push] Removidos ${invalidSubscriptions.length} token(s) inválido(s)`,
          );
        }
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
