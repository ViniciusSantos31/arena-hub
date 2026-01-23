import { Status } from "@/app/(protected)/group/[code]/matches/(detail)/[id]/page";

export interface JoinMatchData {
  player: {
    id: string;
    name: string;
    score: number;
    image: string | null;
  };
  matchId: string;
}

export interface LeftMatchData {
  playerId: string;
  matchId: string;
}

export const WebSocketMessageType = {
  MATCH_STATUS_UPDATED: "match_status_updated",
  SUBSCRIBE_USER_ON_MATCH_CHANNEL: "subscribe_user_on_match_channel",
  MATCH_PARTICIPANT_JOINED: "match_participant_joined",
  MATCH_PARTICIPANT_LEFT: "match_participant_left",
  MATCH_CANCELLED: "match_cancelled",
  MESSAGE_CHAT: "message_chat",
  // SYSTEM: "system",
  // NOTIFICATION: "notification",
} as const;

export type WebSocketEventType =
  (typeof WebSocketMessageType)[keyof typeof WebSocketMessageType];

export type WebSocketEventPayloadMap = {
  [WebSocketMessageType.SUBSCRIBE_USER_ON_MATCH_CHANNEL]: { matchId: string };
  [WebSocketMessageType.MATCH_PARTICIPANT_JOINED]: JoinMatchData;
  [WebSocketMessageType.MATCH_PARTICIPANT_LEFT]: LeftMatchData;
  [WebSocketMessageType.MATCH_CANCELLED]: { matchId: string; reason: string };
  [WebSocketMessageType.MESSAGE_CHAT]: {
    matchId: string;
    message: string;
    senderId: string;
    senderName: string;
  };
  [WebSocketMessageType.MATCH_STATUS_UPDATED]: {
    matchId: string;
    status: Status;
  };
  // [WebSocketMessageType.SYSTEM]: { message: string };
  // [WebSocketMessageType.NOTIFICATION]: { title: string; message: string };
};

export type WebSocketEventPayload<T extends WebSocketEventType> =
  WebSocketEventPayloadMap[T];

export interface JoinMatchSocketEventData {
  event: typeof WebSocketMessageType.MATCH_PARTICIPANT_JOINED;
  payload: JoinMatchData;
}

export interface LeftMatchSocketEventData {
  event: typeof WebSocketMessageType.MATCH_PARTICIPANT_LEFT;
  payload: LeftMatchData;
}

export interface ListenMatchChannelEventData {
  event: typeof WebSocketMessageType.SUBSCRIBE_USER_ON_MATCH_CHANNEL;
  payload: { matchId: string };
}

export interface MatchStatusUpdateEventData {
  event: typeof WebSocketMessageType.MATCH_STATUS_UPDATED;
  payload: {
    matchId: string;
    status: Status;
  };
}

export type WebSocketEventData =
  | JoinMatchSocketEventData
  | LeftMatchSocketEventData
  | ListenMatchChannelEventData
  | MatchStatusUpdateEventData;
