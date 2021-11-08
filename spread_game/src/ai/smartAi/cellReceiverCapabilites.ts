import { HistoryEntry } from "../../messages/replay/replay";
import { getAttackerData } from "../reach";
import { ReachableMap } from "../reachableMap";
import { CellSenderCapabilities } from "./cellSenderCapabilities";
import { PerPlayer, PerPlayerImplementation } from "./perPlayer";

export interface UnitsReceived {
    earliestPossibleReceiverTimeInMs: number;
    latestPossibleReceiverTimeInMs: number;
    durationInMs: number;
    senderPlayerId: number;
    units: number;
}

export interface CellReceiveData {
    timeline: UnitsReceived[];
}

export const evalReceiverData = (
    recData: CellReceiveData
): HistoryEntry<PerPlayer<number>>[] => {
    const timestamps = recData.timeline
        .flatMap((rd) => [
            rd.latestPossibleReceiverTimeInMs,
            rd.earliestPossibleReceiverTimeInMs,
        ])
        .sort((x, y) => x - y)
        .filter((val, index, arr) => index === 0 || arr[index - 1] !== val);
    const res: HistoryEntry<PerPlayer<number>>[] = timestamps.map(
        (timeStamp) => {
            const relevant = recData.timeline.filter(
                (rd) =>
                    rd.earliestPossibleReceiverTimeInMs < timeStamp &&
                    timeStamp <= rd.latestPossibleReceiverTimeInMs
            );
            const perPlayer: PerPlayer<number> = new PerPlayerImplementation();
            relevant.forEach((rel) => {
                let ex = perPlayer.get(rel.senderPlayerId);
                if (ex === null) ex = 0;
                perPlayer.set(rel.senderPlayerId, ex + rel.units);
            });
            return { timestamp: timeStamp, data: perPlayer };
        }
    );
    return [...res];
};

export interface CellReceiverCapabilities {
    get: (receiverId: number) => CellReceiveData | null;
    set: (receiverId: number, imp: CellReceiveData) => void;
}

export class CellReceiverCapabilityImplementation
    implements CellReceiverCapabilities
{
    store: { receiverId: number; impact: CellReceiveData }[];
    constructor(reachMap: ReachableMap, senderCaps: CellSenderCapabilities) {
        // assumes that senderCaps has an entry for every cell
        const cellIds = senderCaps.getCellIds();
        this.store = [];
        cellIds.forEach((receiverId) => {
            const recData: UnitsReceived[] = [];

            cellIds.forEach((senderId) => {
                if (senderId === receiverId) return;
                const reach = reachMap.get(senderId, receiverId);
                if (reach === null) return;
                const senderData = senderCaps.get(senderId);
                if (senderData === null) return;
                recData.push(
                    ...senderData.timeline.map((us) => {
                        const attData = getAttackerData(
                            us.availableAttackers,
                            reach
                        );
                        return {
                            units: attData.effectiveAttackers,
                            earliestPossibleReceiverTimeInMs:
                                us.earliestPossibleTimeInMs +
                                attData.durationInMs,
                            latestPossibleReceiverTimeInMs:
                                us.latestPossibleTimeInMs === null
                                    ? Infinity
                                    : us.latestPossibleTimeInMs +
                                      attData.durationInMs,
                            durationInMs: attData.durationInMs,
                            senderPlayerId: us.senderPlayerId,
                        };
                    })
                );
            });

            this.set(receiverId, { timeline: recData });
        });
    }
    get(receiverId: number) {
        const res = this.store.find((val) => val.receiverId === receiverId);
        if (res === undefined) return null;
        else return res.impact;
    }
    set(receiverId: number, imp: CellReceiveData) {
        imp.timeline.sort((ur1, ur2) => {
            const diffArrival =
                ur1.earliestPossibleReceiverTimeInMs +
                ur1.durationInMs -
                (ur2.earliestPossibleReceiverTimeInMs + ur2.durationInMs);
            if (diffArrival !== 0) return diffArrival;
            if (
                ur1.latestPossibleReceiverTimeInMs === null ||
                ur2.latestPossibleReceiverTimeInMs === null
            ) {
                if (
                    ur1.latestPossibleReceiverTimeInMs ===
                    ur2.latestPossibleReceiverTimeInMs
                )
                    return ur1.units - ur2.units;
                else
                    return ur1.latestPossibleReceiverTimeInMs === null ? 1 : -1;
            } else
                return (
                    ur1.latestPossibleReceiverTimeInMs +
                    ur1.durationInMs -
                    (ur2.latestPossibleReceiverTimeInMs + ur2.durationInMs)
                );
        });

        const index = this.store.findIndex(
            (val) => val.receiverId === receiverId
        );
        const val = {
            receiverId: receiverId,
            impact: imp,
        };
        if (index < 0) this.store.push(val);
        else this.store[index] = val;
    }
}
