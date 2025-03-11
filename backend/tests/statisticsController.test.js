// Import dependencies
const { getStatistics } = require("../controllers/statisticsController");
const Project = require("../models/Project");

// Mock the Project model methods
jest.mock("../models/Project");

describe("getStatistics", () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
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
    // Mock the Project.find method to return a list of projects
    Project.find.mockResolvedValue([
      { status: "Planning", budget: 1000, samples: [{}, {}] },
      { status: "Active", budget: 2000, samples: [{}] },
      { status: "Completed", budget: 1500, samples: [{}, {}, {}] },
      { status: "On Hold", budget: 500, samples: [] },
      { status: "Cancelled", budget: 0, samples: [] },
    ]);

    // Call the function
    await getStatistics(req, res);

    // Assertions to check if the response is correct
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
    // Mock the Project.find method to simulate an error
    Project.find.mockRejectedValue(new Error("Database error"));

    // Call the function
    await getStatistics(req, res);

    // Assertions to check if the error handling works
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
