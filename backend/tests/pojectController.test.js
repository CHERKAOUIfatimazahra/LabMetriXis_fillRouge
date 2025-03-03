const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const projectController = require("../controllers/projectController");
const Project = require("../models/Project");
const Sample = require("../models/Sample");
const app = express();

// Basic setup
app.use(bodyParser.json());

// Mock ObjectID for consistent testing
const mockUserId = new mongoose.Types.ObjectId();
const mockProjectId = new mongoose.Types.ObjectId();
const mockSampleId = new mongoose.Types.ObjectId();

// Mock authentication middleware
app.use((req, res, next) => {
  if (req.headers.authorization) {
    // Simulate authenticated user with researcher role
    req.user = {
      _id: mockUserId,
      id: mockUserId.toString(),
      role: "Researcher",
    };
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

// Mock role-based authorization middleware
const checkRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Insufficient role" });
  }
};

// Set up routes with proper middleware
app.post("/projects", checkRole("Researcher"), projectController.createProject);
app.post(
  "/projects/:projectId/samples",
  checkRole("Researcher"),
  projectController.addSampleToProject
);
app.get("/projects/:projectId/samples", projectController.getSamplesByProject);
app.get("/projects", projectController.getAllProjects);

// Mock implementations for the Project model
jest.mock("../models/Project", () => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
});

// Mock implementations for the Sample model
jest.mock("../models/Sample", () => {
  return {
    create: jest.fn(),
    find: jest.fn(),
  };
});

describe("Project Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for project creation
  describe("POST /projects", () => {
    it("should create a project successfully", async () => {
      // Define valid project data
      const projectData = {
        projectName: "New Research Project",
        researchDomain: "Biology",
        teamLead: mockUserId,
        startDate: new Date().toISOString(),
        deadline: new Date().toISOString(),
        description: "Project description",
      };

      // Mock successful project creation
      const savedProject = {
        ...projectData,
        _id: mockProjectId,
        createdBy: mockUserId,
      };

      Project.create.mockResolvedValue(savedProject);

      const res = await request(app)
        .post("/projects")
        .send(projectData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Project created successfully");
      expect(Project.create).toHaveBeenCalledWith({
        ...projectData,
        createdBy: mockUserId,
      });
    });

    it("should return 400 if required fields are missing", async () => {
      // Missing required fields
      const incompleteData = {
        projectName: "Incomplete Project",
        teamLead: mockUserId.toString(),
      };

      const res = await request(app)
        .post("/projects")
        .send(incompleteData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });

    it("should return 401 if no token is provided", async () => {
      const projectData = {
        projectName: "Unauthorized Project",
        researchDomain: "Biology",
        teamLead: mockUserId.toString(),
        startDate: new Date().toISOString(),
        deadline: new Date().toISOString(),
        description: "Project description",
      };

      const res = await request(app).post("/projects").send(projectData);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("should return 403 if user has insufficient role", async () => {
      // Override the user role for this test
      app.use((req, res, next) => {
        req.user = { ...req.user, role: "Technician" }; // Not a Researcher
        next();
      });

      const projectData = {
        projectName: "Forbidden Project",
        researchDomain: "Biology",
        teamLead: mockUserId.toString(),
        startDate: new Date().toISOString(),
        deadline: new Date().toISOString(),
        description: "Project description",
      };

      const res = await request(app)
        .post("/projects")
        .send(projectData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden: Insufficient role");
    });

    it("should handle database errors properly", async () => {
      const projectData = {
        projectName: "Error Project",
        researchDomain: "Biology",
        teamLead: mockUserId,
        startDate: new Date().toISOString(),
        deadline: new Date().toISOString(),
        description: "Project description",
      };

      // Mock database error
      Project.create.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .post("/projects")
        .send(projectData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to create project");
    });
  });

  // Tests for adding samples to projects
  describe("POST /projects/:projectId/samples", () => {
    it("should add a sample to the project successfully", async () => {
      // Mock project retrieval
      const mockProject = {
        _id: mockProjectId,
        projectName: "Test Project",
        samples: [],
      };

      Project.findById.mockResolvedValue(mockProject);

      // Sample data
      const sampleData = {
        name: "Test Sample",
        description: "Sample description",
        type: "Blood",
        quantity: 10,
        unit: "ml",
        collectionDate: new Date().toISOString(),
        identification: "SAMPLE-001",
      };

      // Mock successful sample creation
      const createdSample = {
        ...sampleData,
        _id: mockSampleId,
        project: mockProjectId,
        createdBy: mockUserId,
        technicianResponsible: mockUserId,
        save: jest.fn().mockResolvedValue(true),
      };

      Sample.create = jest.fn().mockResolvedValue(createdSample);

      // Mock project update
      mockProject.samples.push(mockSampleId);
      mockProject.save = jest.fn().mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/projects/${mockProjectId}/samples`)
        .send(sampleData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Sample added successfully");
      expect(Sample.create).toHaveBeenCalledWith({
        ...sampleData,
        project: mockProjectId.toString(),
        createdBy: mockUserId,
        technicianResponsible: mockUserId,
      });
    });

    it("should return 404 if project is not found", async () => {
      Project.findById.mockResolvedValue(null);

      const sampleData = {
        name: "Test Sample",
        description: "Sample description",
        type: "Blood",
        quantity: 10,
        unit: "ml",
        collectionDate: new Date().toISOString(),
        identification: "SAMPLE-002",
      };

      const res = await request(app)
        .post(`/projects/${mockProjectId}/samples`)
        .send(sampleData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Project not found");
    });

    it("should return 400 if required sample data is missing", async () => {
      Project.findById.mockResolvedValue({
        _id: mockProjectId,
        projectName: "Test Project",
        samples: [],
      });

      // Missing required fields
      const incompleteData = {
        name: "Test Sample",
        // Missing description, type, etc.
      };

      const res = await request(app)
        .post(`/projects/${mockProjectId}/samples`)
        .send(incompleteData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required sample data");
    });

    it("should handle duplicate identification error", async () => {
      Project.findById.mockResolvedValue({
        _id: mockProjectId,
        projectName: "Test Project",
        samples: [],
      });

      const sampleData = {
        name: "Test Sample",
        description: "Sample description",
        type: "Blood",
        quantity: 10,
        unit: "ml",
        collectionDate: new Date().toISOString(),
        identification: "SAMPLE-003",
      };

      // Mock MongoDB duplicate key error
      const duplicateError = new Error("Duplicate key error");
      duplicateError.code = 11000;
      Sample.create = jest.fn().mockRejectedValue(duplicateError);

      const res = await request(app)
        .post(`/projects/${mockProjectId}/samples`)
        .send(sampleData)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Sample identification already exists");
    });
  });

  // Tests for retrieving samples from a project
  describe("GET /projects/:projectId/samples", () => {
    it("should retrieve all samples for a project", async () => {
      const mockProject = {
        _id: mockProjectId,
        projectName: "Test Project",
        samples: [mockSampleId],
      };

      Project.findById.mockResolvedValue(mockProject);

      const mockSamples = [
        {
          _id: mockSampleId,
          name: "Test Sample",
          description: "Sample description",
          type: "Blood",
          status: "Pending",
        },
      ];

      Sample.find.mockResolvedValue(mockSamples);

      const res = await request(app)
        .get(`/projects/${mockProjectId}/samples`)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("Test Sample");
    });

    it("should return 404 if project is not found", async () => {
      Project.findById.mockResolvedValue(null);

      const res = await request(app)
        .get(`/projects/${mockProjectId}/samples`)
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Project not found");
    });
  });

  // Tests for retrieving all projects
  describe("GET /projects", () => {
    it("should return all projects associated with the user", async () => {
      const mockProjects = [
        {
          _id: mockProjectId,
          projectName: "User's Project",
          researchDomain: "Biology",
          teamLead: mockUserId,
          description: "A project",
        },
      ];

      // Mock the find with different query results
      Project.find.mockImplementation((query) => {
        // If query has createdBy or teamLead matching mockUserId
        if (
          query.$or &&
          query.$or.some(
            (q) =>
              (q.createdBy && q.createdBy.equals(mockUserId)) ||
              (q.teamLead && q.teamLead.equals(mockUserId)) ||
              (q["teamMembers.user"] &&
                q["teamMembers.user"].equals(mockUserId))
          )
        ) {
          return {
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockProjects),
            }),
          };
        }
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
          }),
        };
      });

      const res = await request(app)
        .get("/projects")
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].projectName).toBe("User's Project");
    });

    it("should return empty array if user has no projects", async () => {
      Project.find.mockImplementation(() => {
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([]),
          }),
        };
      });

      const res = await request(app)
        .get("/projects")
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should handle database errors properly", async () => {
      Project.find.mockImplementation(() => {
        return {
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error("Database error")),
          }),
        };
      });

      const res = await request(app)
        .get("/projects")
        .set("Authorization", "Bearer mock_token");

      expect(res.status).toBe(500);
      expect(res.body.error).toBeTruthy();
    });
  });
});
