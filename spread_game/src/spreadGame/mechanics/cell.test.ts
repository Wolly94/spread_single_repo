import Cell from "../cell";
import { radiusToGrowth, radiusToUnits } from "../common";
import basicMechanics from "./basicMechanics";
import { growthUtils } from "./events/growth";

test("units decreasing when too much", () => {
    const radius = 50;
    const maxUnits = radiusToUnits(50);
    var cell: Cell = {
        id: 0,
        playerId: 0,
        position: [100, 100],
        units: maxUnits * 2,
        radius: radius,
    };
    expect(cell.units).toBe(2 * maxUnits);
    const growth = radiusToGrowth(cell.radius);
    const msPerUnit = 1000 / growth;
    const ms = growth * 1000;
    cell = basicMechanics.grow(cell, msPerUnit, growthUtils.default);
    expect(cell.units).toBe(2 * maxUnits - 1);
    cell = basicMechanics.grow(cell, msPerUnit, growthUtils.default);
    cell = basicMechanics.grow(
        cell,
        msPerUnit * (maxUnits - 1),
        growthUtils.default
    );
    expect(cell.units).toBe(maxUnits);
    cell = basicMechanics.grow(cell, msPerUnit, growthUtils.default);
    expect(cell.units).toBe(maxUnits);
    cell = basicMechanics.grow(cell, 5 * msPerUnit, growthUtils.default);
    expect(cell.units).toBe(maxUnits);
});
