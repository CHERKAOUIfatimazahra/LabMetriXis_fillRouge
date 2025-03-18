const request = require("supertest");
const express = require("express");
const {
  getAllSamples,
  updateSampleStatus,
  submitAnalysisReport,
  getAnalysisReport,
} = require("../controllers/sampleController");
const Sample = require("../models/Sample");
const Project = require("../models/Project");
const User = require("../models/User");
const {
  createNotification,
  createNotificationForUsers,
} = require("../controllers/NotificationsController");

jest.mock("../models/Sample");
jest.mock("../models/Project");
jest.mock("../models/User");
jest.mock("../controllers/NotificationsController");

const app = express();
app.use(express.json());

// Mock req.user for authentication
app.use((req, res, next) => {
  req.user = { _id: "123" };
  next();
});

// Mock route handlers
// Setting up params.id to match the controller implementation
app.get(
  "/samples",
  (req, res, next) => {
    req.params = { id: "123" };
    next();
  },
  getAllSamples
);
app.patch("/samples/:sampleId/status", updateSampleStatus);
app.post("/samples/:sampleId/analysis-report", submitAnalysisReport);
app.get("/samples/:sampleId/analysis-report", getAnalysisReport);

describe("Sample Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /samples", () => {
    it("should return all samples for a technician", async () => {
      const mockSamples = [
        { _id: "1", technician: "123", name: "Sample 1" },
        { _id: "2", technician: "123", name: "Sample 2" },
      ];

      // Fix the mock chain setup
      const mockPopulateFirst = jest.fn().mockReturnThis();
      const mockPopulateSecond = jest.fn().mockResolvedValue(mockSamples);

      Sample.find.mockReturnValue({
        populate: mockPopulateFirst,
      });

      mockPopulateFirst.mockReturnValue({
        populate: mockPopulateSecond,
      });

      const res = await request(app).get("/samples");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockSamples);
      expect(Sample.find).toHaveBeenCalledWith({ technician: "123" });
    });

    it("should return 500 if there's an error", async () => {
      const mockError = new Error("Database error");

      // Fix the mock chain setup
      const mockPopulateFirst = jest.fn().mockReturnThis();
      const mockPopulateSecond = jest.fn().mockRejectedValue(mockError);

      Sample.find.mockReturnValue({
        populate: mockPopulateFirst,
      });

      mockPopulateFirst.mockReturnValue({
        populate: mockPopulateSecond,
      });

      const res = await request(app).get("/samples");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Database error");
    });
  });

  describe("PATCH /samples/:sampleId/status", () => {
    it("should update sample status successfully", async () => {
      const mockSample = {
        _id: "1",
        status: "In Analysis",
        project: {
          _id: "project-id",
          teamLead: "456",
          teamMembers: ["789"],
        },
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock the populate method
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSample),
      });

      createNotification.mockResolvedValue(true);
      createNotificationForUsers.mockResolvedValue(true);

      const res = await request(app)
        .patch("/samples/1/status")
        .send({ status: "Analyzed" });

      expect(res.status).toBe(200);
      expect(mockSample.status).toBe("Analyzed");
      expect(createNotification).toHaveBeenCalledWith(
        "123",
        "L'analyse de l'échantillon est terminée",
        "1",
        "project-id"
      );
      expect(createNotificationForUsers).toHaveBeenCalled();
    });

    it("should return 400 if status is invalid", async () => {
      const res = await request(app)
        .patch("/samples/1/status")
        .send({ status: "Invalid Status" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid status provided");
    });

    it("should return 404 if sample is not found", async () => {
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .patch("/samples/1/status")
        .send({ status: "Analyzed" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Sample not found");
    });

    it("should return 400 if sample is already in the requested status", async () => {
      const mockSample = {
        _id: "1",
        status: "Analyzed",
        project: { _id: "project-id" },
      };

      Sample.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSample),
      });

      const res = await request(app)
        .patch("/samples/1/status")
        .send({ status: "Analyzed" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Sample already in this status");
    });

    it("should return 500 if there's an error", async () => {
      const mockError = new Error("Database error");
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      const res = await request(app)
        .patch("/samples/1/status")
        .send({ status: "Analyzed" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Internal server error");
    });
  });

  describe("POST /samples/:sampleId/analysis-report", () => {
    it("should return 400 if sample ID is invalid", async () => {
      
      const invalidApp = express();
      invalidApp.use(express.json());
      invalidApp.use((req, res, next) => {
        req.user = { _id: "123" };
        next();
      });

      // Set up a route with an empty sampleId param
      invalidApp.post(
        "/samples/:sampleId/analysis-report",
        (req, res, next) => {
          req.params = { sampleId: null };
          next();
        },
        submitAnalysisReport
      );

      const res = await request(invalidApp)
        .post("/samples/null/analysis-report")
        .send({
          analysisReport: "Sample analysis report data",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("ID d'échantillon invalide");
    });

    it("should return 404 if sample is not found", async () => {
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).post("/samples/999/analysis-report").send({
        analysisReport: "Sample analysis report data",
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Échantillon non trouvé");
    });

    it("should return 400 if status is not 'In Analysis'", async () => {
      const mockSample = {
        _id: "1",
        status: "Analyzed",
        technicianResponsible: "123",
      };

      Sample.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSample),
      });

      const res = await request(app).post("/samples/1/analysis-report").send({
        analysisReport: "Sample analysis report data",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Le rapport ne peut être soumis que pour les échantillons en cours d'analyse"
      );
    });

    it("should return 500 if there's an error", async () => {
      const mockError = new Error("Database error");
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });

      const res = await request(app).post("/samples/1/analysis-report").send({
        analysisReport: "Sample analysis report data",
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Database error");
    });
  });

  describe("GET /samples/:sampleId/analysis-report", () => {
    it("should return the analysis report successfully", async () => {
      const mockDate = new Date("2025-03-18T11:59:37.793Z");
      const mockSample = {
        _id: "1",
        name: "Sample 1",
        analysisReport: "Sample analysis report data",
        status: "Analyzed",
        updatedAt: mockDate,
        technicianResponsible: {
          name: "Technician 1",
          email: "tech@example.com",
        },
      };

      Sample.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockSample),
      });

      const res = await request(app).get("/samples/1/analysis-report");

      expect(res.status).toBe(200);
      expect(res.body.sample).toEqual({
        ...mockSample,
        updatedAt: mockDate.toISOString(),
      });
    });

    it("should return 404 if sample not found", async () => {
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/samples/1/analysis-report");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Échantillon non trouvé");
    });

    it("should return 500 if there's an error", async () => {
      const mockError = new Error("Database error");
      Sample.findById.mockReturnValue({
        populate: jest.fn().mockImplementation(() => {
          throw mockError;
        }),
      });

      const res = await request(app).get("/samples/1/analysis-report");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Database error");
    });
  });
});
