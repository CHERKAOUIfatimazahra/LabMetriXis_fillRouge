const { getStatistics } = require("../controllers/statisticsController");
const Project = require("../models/Project");

jest.mock("../models/Project");

describe("getStatistics", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        id: "user123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return the correct statistics", async () => {

    Project.find.mockResolvedValue([
      { status: "Planning", budget: 1000, samples: [{}, {}] },
      { status: "Active", budget: 2000, samples: [{}] },
      { status: "Completed", budget: 1500, samples: [{}, {}, {}] },
      { status: "On Hold", budget: 500, samples: [] },
      { status: "Cancelled", budget: 0, samples: [] },
    ]);

    await getStatistics(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalProjects: 5,
      statusDistribution: {
        Planning: 1,
        Active: 1,
        Completed: 1,
        OnHold: 1,
        Cancelled: 1,
      },
      budgetStatistics: { totalBudget: 5000 },
      sampleStatistics: { totalSamples: 6 },
    });
  });

  it("should handle errors gracefully", async () => {
    Project.find.mockRejectedValue(new Error("Database error"));


    await getStatistics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
