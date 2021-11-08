import { GameSettings } from "../messages/inGame/gameServerMessages";
import { SkilledPerk } from "../skilltree/skilltree";
import { SpreadMap } from "../spreadGame/map/map";
import { reach, ReachType } from "./reach";

export interface ReachableMap {
    get: (senderId: number, receiverId: number) => ReachType | null;
    set: (senderId: number, receiverId: number, reachType: ReachType) => void;
}

export class ReachableImplementation implements ReachableMap {
    store: { senderId: number; receiverId: number; reachType: ReachType }[];

    constructor(settings: GameSettings, map: SpreadMap, skills: SkilledPerk[]) {
        this.store = [];

        map.cells.forEach((senderCell) => {
            map.cells
                .filter((c) => c.id !== senderCell.id)
                .forEach((receiverCell) => {
                    const r = reach(
                        map,
                        settings,
                        skills,
                        senderCell.id,
                        receiverCell.id
                    );
                    if (r !== null)
                        this.store.push({
                            senderId: senderCell.id,
                            receiverId: receiverCell.id,
                            reachType: r,
                        });
                });
        });
    }

    get(senderId: number, receiverId: number) {
        const res = this.store.find(
            (val) => val.senderId === senderId && val.receiverId === receiverId
        );
        if (res === undefined) return null;
        else return res.reachType;
    }

    set(senderId: number, receiverId: number, reachType: ReachType) {
        const index = this.store.findIndex(
            (val) => val.senderId === senderId && val.receiverId === receiverId
        );
        const val = {senderId: senderId, receiverId: receiverId, reachType: reachType}
        if (index < 0) this.store.push(val)
        else this.store[index] = val
    }
}
