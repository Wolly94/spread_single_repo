import { Effect } from "./definitions";

const type = "TimeStep";

export interface TimeStepEvent {
    type: "TimeStep";
    ms: number;
}

export interface TimeStepEffect extends Effect<TimeStepEvent> {
    type: TimeStepEvent["type"];
}
