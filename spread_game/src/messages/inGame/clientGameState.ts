export interface BubbleData {}

export interface CellData {
    units: number;
    newBubbleRadius: number;
    currentUnitsRadius: number;
    defenderCombatAbilities: number;
    attackerCombatAbilities: number;
    membraneValue: number;
}

export interface ClientBubble {
    id: number;
    playerId: number;

    units: number;
    position: [number, number];
    radius: number;
    attackCombatAbilities: number;

    infected: boolean;
}

export interface ClientCell {
    id: number;
    playerId: number | null;
    radius: number;
    position: [number, number];
    data: CellData | null;

    infected: boolean;
}

export interface ClientGameState {
    timePassedInMs: number;
    cells: ClientCell[];
    bubbles: ClientBubble[];
    deadlyEnvironment: boolean;
}
