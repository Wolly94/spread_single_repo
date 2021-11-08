import { SpreadGameImplementation } from "../../spreadGame";
import { infectBubbleUtils } from "../../spreadGame/mechanics/events/infectBubble";
import { infectCellUtils } from "../../spreadGame/mechanics/events/infectCell";
import { ContaiguousPerk } from "./contaiguous";

test("contaiguous", () => {
    const rep = ContaiguousPerk.replay;
    const game = SpreadGameImplementation.fromReplay(rep);
    game.runReplay(rep, 100);
    while (game.bubbles.length === 1) {
        game.runReplay(rep, rep.gameSettings.updateFrequencyInMs);
    }
    expect(game.bubbles.length).toBe(0);
    const cell1Units = game.cells.find((c) => c.id === 1)?.units;
    while (game.bubbles.length === 0) {
        game.runReplay(rep, rep.gameSettings.updateFrequencyInMs);
    }
    expect(game.bubbles.length).toBe(1);
    const bubble = game.bubbles.find((b) => b.id === 2);
    const cell = game.cells.find((c) => c.id === 1);
    if (bubble === undefined || cell === undefined) {
        expect(true).toBe(false);
    } else {
        const infBubbleProps = infectBubbleUtils.collect(
            game.fromAttachedProps({ type: "Bubble", id: bubble.id })
        );
        expect(infBubbleProps.infectedBy.size).toBe(1);
        const infCellProps = infectCellUtils.collect(
            game.fromAttachedProps({ type: "Cell", id: cell.id })
        );
        expect(infCellProps.infectedBy.size).toBe(1);

        const newCell1Units = game.cells.find((c) => c.id === 1)?.units;
        const bubbleUnits = bubble.units;
        const lhs = cell1Units === undefined ? -2 : cell1Units;
        const rhs =
            newCell1Units === undefined || bubbleUnits === undefined
                ? -1
                : newCell1Units + bubbleUnits;
        expect(lhs).toBe(rhs);
        while (game.bubbles.length === 1) {
            game.runReplay(rep, rep.gameSettings.updateFrequencyInMs);
        }
        expect(game.bubbles.length).toBe(0);
        const cell2Units = game.cells.find((c) => c.id === 2)?.units;
        expect(rep.lengthInMs - game.timePassed).toBeGreaterThan(2000);
        expect(rep.lengthInMs - game.timePassed).toBeLessThan(3000);
        game.runReplay(rep, 500);
        const newCell2Units = game.cells.find((c) => c.id === 2)?.units;
        expect(cell2Units).toBe(newCell2Units);
    }
});
