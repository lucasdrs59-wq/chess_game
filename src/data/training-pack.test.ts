import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";

import trainingPack from "./training-pack.json";

describe("training-pack", () => {
  it.each(trainingPack)("contient une ligne SAN légale pour $id", (puzzle) => {
    const chess = new Chess(puzzle.fen);

    for (const move of puzzle.solutionMovesSAN) {
      expect(() => chess.move(move, { strict: false })).not.toThrow();
    }
  });
});
