import { allPerks, listPerkCreators, numberPerkCreators } from "./perk";

test("added all perks", () => {
    expect(allPerks.length).toBe(
        numberPerkCreators.length + listPerkCreators.length
    );
});
