const request = require("supertest");
const app = require("../../src/app");

describe("GET /api/v1/analytics/age-group-performance", () => {
  it("should return 200 and age group performance data", async () => {
    const response = await request(app)
      .get("/api/v1/analytics/age-group-performance")
      .expect(200);

    expect(response.body).toHaveProperty("buckets");
    expect(response.body).toHaveProperty("meta");
    expect(Array.isArray(response.body.buckets)).toBe(true);
  });

  it("should accept season query parameter", async () => {
    const response = await request(app)
      .get("/api/v1/analytics/age-group-performance?season=2023")
      .expect(200);

    expect(response.body.meta.season).toBe("2023");
  });

  it("should accept tournamentId query parameter", async () => {
    const tournamentId = "550e8400-e29b-41d4-a716-446655440000";
    const response = await request(app)
      .get(
        `/api/v1/analytics/age-group-performance?tournamentId=${tournamentId}`
      )
      .expect(200);

    expect(response.body.meta.tournamentId).toBe(tournamentId);
  });

  it("should return 400 for invalid season", async () => {
    await request(app)
      .get("/api/v1/analytics/age-group-performance?season=invalid")
      .expect(400);
  });

  it("should return 400 for invalid tournamentId", async () => {
    await request(app)
      .get("/api/v1/analytics/age-group-performance?tournamentId=invalid")
      .expect(400);
  });
});
