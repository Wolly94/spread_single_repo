export interface PerPlayer<TData> {
    get: (playerId: number) => TData | null;
    set: (playerId: number, data: TData) => void;
}

export class PerPlayerImplementation<TData> implements PerPlayer<TData> {
    store: { playerId: number; data: TData }[];
    constructor() {
        this.store = [];
    }
    get(playerId: number) {
        const res = this.store.find((s) => s.playerId === playerId);
        if (res === undefined) return null;
        else return res.data;
    }
    set(playerId: number, data: TData) {
        const index = this.store.findIndex((s) => s.playerId === playerId);
        if (index < 0) this.store.push({ playerId: playerId, data: data });
        else this.store[index].data = data;
    }
}
