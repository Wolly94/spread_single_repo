import { SpreadGameImplementation } from "../../spreadGame";

interface FutureCells {}
interface ImpactOnCell {
    cellId: number;
}
type ImpactOnCells = ImpactOnCell[];

enum ImpactType {
    ConquerEnemyCell,
    DefendFriendlyCell,
    ConquerNeutralCell,
}
interface CellValue {}
interface EvaluatedImpact {
    cellId: number;
    impactType: ImpactType;
    value: CellValue;
    timeDiff: number;
}
type EvaluatedImpacts = EvaluatedImpact[];

interface Future {
    getFutureCells: (game: SpreadGameImplementation) => FutureCells;
    getPossibleIncomingUnits: (futureCells: FutureCells) => ImpactOnCells;
    evaluateImpact: (impactOnCell: ImpactOnCell) => EvaluatedImpact;
    compareImpact: (ev1: EvaluatedImpact, ev2: EvaluatedImpact) => number;
}

let getMoves = (future: Future, game: SpreadGameImplementation) => {
    var futureCells = future.getFutureCells(game);
    var possibleIncomings = future.getPossibleIncomingUnits(futureCells);
    var evalImps = possibleIncomings
        .map((val) => future.evaluateImpact(val))
        .sort((a, b) => future.compareImpact(a, b));
};
