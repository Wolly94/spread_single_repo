import { HistoryEntry } from "../../messages/replay/replay";
import {
    CapturedCellEvent,
    CollisionEvent,
    DefendedCellEvent,
    ReinforcedCellEvent,
} from "../../skilltree/events";
import { SpreadGameImplementation } from "../../spreadGame";
import { ReachableMap } from "../reachableMap";
import {
    CellReceiverCapabilities,
    CellReceiverCapabilityImplementation,
} from "./cellReceiverCapabilites";
import {
    CellSenderCapabilities,
    CellSenderCapabilityImplementation,
} from "./cellSenderCapabilities";

const getForecast = (
    game: SpreadGameImplementation,
    reachMap: ReachableMap
) => {
    const senderCapabilities: CellSenderCapabilities =
        CellSenderCapabilityImplementation.fromGame(game);
    const receiverCapabilities: CellReceiverCapabilities =
        new CellReceiverCapabilityImplementation(reachMap, senderCapabilities);
};
