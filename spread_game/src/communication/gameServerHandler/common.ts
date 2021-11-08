import { SkilledPerk, SkillTree } from "../../skilltree/skilltree";
import { getPlayerIds, SpreadMap } from "../../spreadGame/map/map";

export interface PlayerData {
  name: string;
}

export interface RegisteredToken {
  playerData: PlayerData;
  token: string;
}

export interface AiPlayer {
  type: "ai";
  playerId: number;
  skilledPerks: SkilledPerk[];
}

export interface HumanPlayer {
  type: "human";
  token: string;
  playerId: number;
  playerData: PlayerData;
  skilledPerks: SkilledPerk[];
}

export type SeatedPlayer = AiPlayer | HumanPlayer;

export const occupiedSeats = (seatedPlayers: SeatedPlayer[]) => {
  return seatedPlayers.map((sp) => sp.playerId);
};

export const idFromToken = (token: string, seatedPlayers: SeatedPlayer[]) => {
  const sp = seatedPlayers.find(
    (sp) => sp.type === "human" && sp.token === token
  );
  if (sp !== undefined) return sp.playerId;
  else return null;
};

export const remainingSeats = (
  map: SpreadMap,
  seatedPlayers: SeatedPlayer[]
) => {
  if (map === null) {
    return [];
  }
  const seats = getPlayerIds(map);
  const occSeats = occupiedSeats(seatedPlayers);
  const remainingSeats = Array.from(seats).filter(
    (id) => !occSeats.includes(id)
  );
  return remainingSeats.sort((a, b) => a - b);
};
