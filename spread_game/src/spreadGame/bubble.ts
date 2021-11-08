import { unitsToRadius } from "./common";

var bubbleIds = 0;

export const getNewBubbleIndex = () => {
  bubbleIds += 1;
  return bubbleIds;
};
export interface BubbleCreator {
  id: number;
  playerId: number;
  motherId: number;
  position: [number, number];
  direction: [number, number];
  units: number;
  targetId: number;
  targetPos: [number, number];
  creationTime: number;
}

interface Bubble {
  id: number;
  playerId: number;
  motherId: number;
  position: [number, number];
  direction: [number, number];
  radius: number;
  units: number;
  targetId: number;
  targetPos: [number, number];
  creationTime: number;
}

export const setUnits = (bubble: Bubble, units: number): Bubble => {
  return { ...bubble, units: units, radius: unitsToRadius(units) };
};

export const createBubble = (bc: BubbleCreator): Bubble => {
  const b: Bubble = { ...bc, radius: 0 };
  return setUnits(b, b.units);
};

export default Bubble;
