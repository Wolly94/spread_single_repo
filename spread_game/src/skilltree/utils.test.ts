import { formatDescription } from "./utils";

test("test format description", () => {
  const l = [1, 1, 1];
  const s = formatDescription(l, (s) => s.toString() + "%", "/");
  expect(s).toBe("1%");
});

test("test format description", () => {
  const l = [1, 2, 3];
  const s = formatDescription(l, (s) => s.toString() + "%", "/");
  expect(s).toBe("1%/2%/3%");
});
