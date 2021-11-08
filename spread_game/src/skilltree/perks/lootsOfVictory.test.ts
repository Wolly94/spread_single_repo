import SpreadReplay from "../../messages/replay/replay";
import { SpreadGameImplementation } from "../../spreadGame";
import { LootsOfVictoryPerk } from "./lootsOfVictory";

test("test lootsOfVictory", () => {
  const rep = LootsOfVictoryPerk.replay;
  const game = SpreadGameImplementation.fromReplay(rep);
  game.runReplay(rep, 5000);
  const cstate = game.toClientGameState();
  const cell = cstate.cells.find((c) => c.id === 0);
  expect(cell?.playerId).toBe(0);
});

test("test no lootsOfVictory", () => {
  const rep: SpreadReplay = {
    ...LootsOfVictoryPerk.replay,
    players: [
      { id: 0, skills: [] },
      { id: 1, skills: [] },
    ],
  };
  const game = SpreadGameImplementation.fromReplay(rep);
  game.runReplay(rep, 5000);
  const cstate = game.toClientGameState();
  const cell = cstate.cells.find((c) => c.id === 0);
  expect(cell?.playerId).toBe(1);
});
