import { SpreadMap } from "../../spreadGame/map/map";
import { SendReplayMessage } from "../replay/serverReplayMessages";
import { ClientGameState } from "./clientGameState";
import { SkilledPerkData } from "./clientLobbyMessage";

export type GameMechanics = "basic" | "scrapeoff" | "bounce";
export const gameMechs: GameMechanics[] = ["basic", "scrapeoff", "bounce"];

export const toGameMechanics = (s: string): GameMechanics | null => {
  if (s === "basic") return s;
  else if (s === "scrapeoff") return s;
  else if (s === "bounce") return s;
  else return null;
};

export interface GameSettings {
  mechanics: GameMechanics;
  updateFrequencyInMs: number;
}

export interface SetPlayerIdMessage {
  type: "playerid";
  data: {
    playerId: number | null;
  };
}

export interface ClientAiPlayer {
  type: "ai";
  playerId: number;
  skilledPerks: SkilledPerkData[];
}

export interface ClientHumanPlayer {
  type: "human";
  name: string;
  playerId: number;
  skilledPerks: SkilledPerkData[];
}

export interface ClientObserver {
  name: string;
}

export type ClientLobbyPlayer = ClientAiPlayer | ClientHumanPlayer;

export interface PerkData {
  name: string;
}

export interface SkillData {
  name: string;
  perks: PerkData[];
}

export interface SkillTreeData {
  skills: SkillData[];
}

export interface ClientLobbyState {
  players: ClientLobbyPlayer[];
  observers: ClientObserver[];
  map: SpreadMap | null;
  skillTree: SkillTreeData;
  gameSettings: GameSettings;
}

export interface LobbyStateMessage {
  type: "lobbystate";
  data: ClientLobbyState;
}

export interface GameStateMessage {
  type: "gamestate";
  data: ClientGameState;
}

export interface GameOverMessage {
  type: "gameover";
  data: null;
}

export type ServerLobbyMessage = SetPlayerIdMessage | LobbyStateMessage;
export type ServerInGameMessage = GameStateMessage | GameOverMessage;

export type GameServerMessage =
  | ServerLobbyMessage
  | ServerInGameMessage
  | SendReplayMessage;

export const isServerLobbyMessage = (
  msg: GameServerMessage
): msg is ServerLobbyMessage => {
  return msg.type === "lobbystate" || msg.type === "playerid";
};
