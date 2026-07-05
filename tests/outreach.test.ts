import { describe, expect, it } from "vitest";
import {
  analyzeReviewsGap,
  buildEmailSequence,
  generateColdEmail,
  scoreLocalLead,
} from "../src/outreach.js";

describe("generateColdEmail", () => {
  it("includes business name and trade-specific hook", () => {
    const result = generateColdEmail({
      trade: "hvac",
      businessName: "Cool Air Pros",
      city: "Austin",
      ownerName: "Mike",
    });
    expect(result.subject).toContain("Austin");
    expect(result.body).toContain("Cool Air Pros");
    expect(result.body).toContain("Mike");
    expect(result.trade.id).toBe("hvac");
  });
});

describe("scoreLocalLead", () => {
  it("marks high-signal leads as hot", () => {
    const result = scoreLocalLead({
      trade: "plumbing",
      googleRating: 4.3,
      reviewCount: 45,
      hasWebsite: false,
      afterHoursCalls: true,
      estimatedEmployees: 8,
    });
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.tier).toBe("hot");
  });
});

describe("buildEmailSequence", () => {
  it("returns 3 emails on day 0, 3, 7", () => {
    const seq = buildEmailSequence({
      trade: "electrical",
      businessName: "Spark Electric",
      city: "Dallas",
    });
    expect(seq.emails).toHaveLength(3);
    expect(seq.emails.map((e) => e.day)).toEqual([0, 3, 7]);
  });
});

describe("analyzeReviewsGap", () => {
  it("finds gaps when rating and reviews are low", () => {
    const result = analyzeReviewsGap({
      trade: "dental",
      businessName: "Smile Studio",
      googleRating: 4.1,
      reviewCount: 12,
      competitorAvgRating: 4.6,
      unansweredReviews: 3,
    });
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.priorityScore).toBeGreaterThan(50);
  });
});
