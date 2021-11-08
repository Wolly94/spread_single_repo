import { SpreadMap } from "../../spreadGame/map/map";
import { GameSettings } from "./gameServerMessages";

export interface SetMapMessage {
  type: "setmap";
  data: SpreadMap;
}

export interface StartGameMessage {
  type: "startgame";
  data: {};
}

export interface TakeSeatMessage {
  type: "takeseat";
  data: { playerId: number };
}

export interface SeatAiMessage {
  type: "seatai";
  data: { playerId: number };
}

export interface ClearSeatMessage {
  type: "clearseat";
  data: { playerId: number };
}

export interface SetGameSettingsMessage {
  type: "gamesettings";
  data: GameSettings;
}

export interface SkilledPerkData {
  name: string;
  level: number;
}

export interface SetSkilledPerksMessage {
  type: "setskilledperks";
  data: SkilledPerkData[];
}

export interface SetAiSkilledPerksMessage {
  type: "setaiskilledperks";
  data: {
    skilledPerkData: SkilledPerkData[];
    playerId: number;
  };
}

export type ClientLobbyMessage =
  | SetMapMessage
  | StartGameMessage
  | TakeSeatMessage
  | SeatAiMessage
  | ClearSeatMessage
  | SetGameSettingsMessage
  | SetSkilledPerksMessage
  | SetAiSkilledPerksMessage;
