import { describe, expect, it } from "vitest";

import { extractTags, parsePgnCollection, parsePgnGame } from "./pgnParser";

const sample = `[Event "Démo"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0`;

describe("pgnParser", () => {
  it("extrait les métadonnées", () => {
    expect(extractTags(sample)).toMatchObject({ White: "Alice", Black: "Bob", Result: "1-0" });
  });

  it("rejoue chaque demi-coup", () => {
    const game = parsePgnGame(sample);
    expect(game.moves).toHaveLength(6);
    expect(game.fenByPly).toHaveLength(7);
  });

  it("sépare plusieurs parties", () => {
    expect(parsePgnCollection(`${sample}\n\n${sample.replace("Démo", "Démo 2")}`)).toHaveLength(2);
  });
});
