import { describe, expect, it } from "vitest";

import { recordTrainingResult, scheduleNextReview, selectTrainingPuzzle } from "./trainingService";

describe("trainingService", () => {
  it("sélectionne un puzzle dans la fenêtre de difficulté", () => {
    const puzzle = selectTrainingPuzzle({
      settings: { trainingDifficulty: 1200 },
      mistakes: [{ category: "fork", createdAt: "2026-01-01T00:00:00.000Z" }],
      history: [],
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(puzzle).not.toBeNull();
    expect(puzzle?.difficulty).toBeGreaterThanOrEqual(1050);
    expect(puzzle?.difficulty).toBeLessThanOrEqual(1350);
  });

  it("programme un échec dès le lendemain", () => {
    const review = scheduleNextReview({
      puzzleId: "tp-001",
      result: "fail",
      history: [],
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(review.nextReviewAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("conserve l'historique existant", () => {
    const existing = [{
      puzzleId: "tp-001",
      result: "ok" as const,
      reviewedAt: "2026-01-01T00:00:00.000Z",
      nextReviewAt: "2026-01-04T00:00:00.000Z",
    }];

    expect(recordTrainingResult({
      history: existing,
      puzzleId: "tp-001",
      result: "ok",
      now: new Date("2026-01-04T00:00:00.000Z"),
    })).toHaveLength(2);
  });
});
