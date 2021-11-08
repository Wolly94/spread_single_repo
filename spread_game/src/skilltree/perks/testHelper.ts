import { PlayerData } from "../../spreadGame/player";

export const playersWithoutSkills = (n: number): PlayerData[] => {
  const l = new Array(n).fill("");
  return l.map((v, index) => {
    return { id: index, skills: [] };
  });
};
