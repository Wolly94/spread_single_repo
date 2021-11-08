import { CapturedCellEvent, DefeatedBubbleEvent, DefendedCellEvent, ReinforcedCellEvent } from "../../../skilltree/events"
import { SpreadGameImplementation } from "../../spreadGame"
import {
    ConquerCellEffect,
    ConquerCellProps
} from "./conquerCell"
import { CreateBubbleEffect, CreateBubbleEvent } from "./createBubble"
import {
    DefendCellEffect,
    DefendCellProps
} from "./defendCell"
import {
    BeforeFightEffect,
    BeforeFightEvent,
    BubbleFightProps,
    CellFightProps
} from "./fight"
import { GrowthEffect, GrowthEvent, GrowthProps } from "./growth"
import { InfectBubbleProps } from "./infectBubble"
import { InfectCellProps } from "./infectCell"
import { MoveEffect, MoveEvent, MoveProps } from "./move"
import { RaisableEvent, RaiseEventEffect, RaiseEventProps } from "./raiseEvent"
import { ReinforceCellEffect } from "./reinforceCell"
import { SendUnitsEffect, SendUnitsEvent, SendUnitsProps } from "./sendUnits"
import {
    StartGameCellProps,
    StartGameEffect,
    StartGameEvent
} from "./startGame"
import { StolenPerksProps } from "./stolenPerk"
import { TimeStepEffect, TimeStepEvent } from "./timeStep"
import { VisualizeBubbleProps } from "./visualizeBubbleProps"
import { VisualizeCellProps } from "./visualizeCellProps"
import { VisualizeGameProps } from "./visualizeGameProps"

export type PropUtils<TProps> = {
    combine: (a: TProps, b: TProps) => TProps;
    collect: (props: SpreadGameProps[]) => TProps;
    default: TProps;
};

export type NewSpreadGameEvent =
    | TimeStepEvent
    | StartGameEvent
    | CreateBubbleEvent
    | SendUnitsEvent
    | CapturedCellEvent
    | DefendedCellEvent
    | DefeatedBubbleEvent
    | BeforeFightEvent
    | GrowthEvent
    | MoveEvent
    | RaisableEvent
    | ReinforcedCellEvent;

export type SpreadGameProps =
    | StartGameCellProps
    | ConquerCellProps
    | SendUnitsProps
    | BubbleFightProps
    | CellFightProps
    | DefendCellProps
    | VisualizeCellProps
    | VisualizeBubbleProps
    | VisualizeGameProps
    | GrowthProps
    | MoveProps
    | StolenPerksProps
    | InfectCellProps
    | InfectBubbleProps
    | RaiseEventProps;

export interface TimedProps<TProps> {
    expirationInMs: "Never" | number;
    value: TProps;
}

export interface Entity {
    type: "Game" | "Player" | "Bubble" | "Cell";
    id: number | null;
}

export interface AttachProps<TProps> {
    entity: Entity | null;
    perkName: string;
    triggerType: string;
    props: TProps;
}

export interface Effect<TEvent> {
    getValue: (
        trigger: TEvent,
        spreadGame: SpreadGameImplementation
    ) => AttachProps<TimedProps<SpreadGameProps | RaiseEventProps>>[];
}

export type SpreadGameEffect =
    | TimeStepEffect
    | StartGameEffect
    | ConquerCellEffect
    | SendUnitsEffect
    | CreateBubbleEffect
    | DefendCellEffect
    | BeforeFightEffect
    | GrowthEffect
    | MoveEffect
    | RaiseEventEffect
    | ReinforceCellEffect;

/*

Events:

*/
