import { SkilledPerkData } from "../messages/inGame/clientLobbyMessage";
import { SkilledPerk, skillTreeMethods } from "../skilltree/skilltree";

interface Player {
  id: number;
  skills: SkilledPerk[];
}

export interface PlayerData {
  id: number;
  skills: SkilledPerkData[];
}

export const playerFromData = (playerData: PlayerData): Player => {
  return {
    id: playerData.id,
    skills: skillTreeMethods.toSkilledPerks(playerData.skills),
  };
};

export const dataFromPlayer = (player: Player): PlayerData => {
  return {
    id: player.id,
    skills: skillTreeMethods.toSkilledPerkData(player.skills),
  };
};

export default Player;
