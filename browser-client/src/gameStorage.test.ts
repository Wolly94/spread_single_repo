import { isLeft, isRight } from "fp-ts/lib/Either";
import { FoundGameResponse } from "./foundGameResponse"

test("decode message", () => {
    const game: FoundGameResponse = {
        "id": "123",
        "url": "abc",
    };

    const s = JSON.stringify(game);

    const parsed = JSON.parse(s);

    const decoded = FoundGameResponse.decode(parsed);

    expect(isRight(decoded)).toBeTruthy();
})