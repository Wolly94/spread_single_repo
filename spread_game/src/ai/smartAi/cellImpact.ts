import { CellImpactData } from "./cellSenderCapabilities"

interface CellImpactCollector {
    get: (senderId: number, receiverId: number) => CellImpactData | null;
    set: (senderId: number, receiverId: number, imp: CellImpactData) => void;
}

export class CellImpactCollectorImplementation implements CellImpactCollector {
    store: { senderId: number; receiverId: number; impact: CellImpactData }[];
    constructor() {
        this.store = [];
    }
    get(senderId: number, receiverId: number) {
        const res = this.store.find(
            (val) => val.senderId === senderId && val.receiverId === receiverId
        );
        if (res === undefined) return null;
        else return res.impact;
    }
    set(senderId: number, receiverId: number, imp: CellImpactData) {
        const index = this.store.findIndex(
            (val) => val.senderId === senderId && val.receiverId === receiverId
        );
        const val = {
            senderId: senderId,
            receiverId: receiverId,
            impact: imp,
        };
        if (index < 0) this.store.push(val);
        else this.store[index] = val;
    }
}
