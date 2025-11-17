const analyticsService = require("../../src/services/analyticsService");

describe("getAgeGroupPerformance", () => {
  it("should return age group performance data with correct buckets", async () => {
    const result = await analyticsService.getAgeGroupPerformance();

    expect(result).toHaveProperty("buckets");
    expect(result).toHaveProperty("meta");
    expect(Array.isArray(result.buckets)).toBe(true);

    // Check that buckets contain expected structure
    if (result.buckets.length > 0) {
      const bucket = result.buckets[0];
      expect(bucket).toHaveProperty("bucket");
      expect(bucket).toHaveProperty("avgPerformance");
      expect(bucket).toHaveProperty("count");
      expect(typeof bucket.avgPerformance).toBe("string");
      expect(typeof bucket.count).toBe("number");
    }

    // Check meta structure
    expect(result.meta).toHaveProperty("season");
    expect(result.meta).toHaveProperty("tournamentId");
    expect(result.meta).toHaveProperty("totalSamples");
    expect(typeof result.meta.totalSamples).toBe("number");
  });

  it("should filter by season when provided", async () => {
    const season = 2023;
    const result = await analyticsService.getAgeGroupPerformance(season);

    expect(result.meta.season).toBe(season);
  });

  it("should filter by tournamentId when provided", async () => {
    const tournamentId = "550e8400-e29b-41d4-a716-446655440000";
    const result = await analyticsService.getAgeGroupPerformance(
      null,
      tournamentId
    );

    expect(result.meta.tournamentId).toBe(tournamentId);
  });

  it("should filter by both season and tournamentId when provided", async () => {
    const season = 2023;
    const tournamentId = "550e8400-e29b-41d4-a716-446655440000";
    const result = await analyticsService.getAgeGroupPerformance(
      season,
      tournamentId
    );

    expect(result.meta.season).toBe(season);
    expect(result.meta.tournamentId).toBe(tournamentId);
  });
});
