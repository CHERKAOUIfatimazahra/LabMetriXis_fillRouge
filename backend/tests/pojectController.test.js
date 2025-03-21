const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const projectController = require("../controllers/projectController");
const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  createNotification,
  createNotificationForUsers,
} = require("../controllers/NotificationsController");

jest.mock("../controllers/NotificationsController", () => ({
  createNotification: jest.fn().mockResolvedValue({}),
  createNotificationForUsers: jest.fn().mockResolvedValue({}),
}));

const authMiddleware = (req, res, next) => {
  req.user = {
    _id: "mockUserId",
    id: "mockUserId",
    name: "Test User",
    email: "test@example.com",
    role: "admin",
  };
  next();
};

const app = express();
app.use(bodyParser.json());
app.use(authMiddleware);

app.post("/projects", projectController.createProject);
app.post("/projects/:projectId/samples", projectController.addSampleToProject);
app.get("/projects/:projectId/samples", projectController.getSamplesByProject);
app.get("/projects", projectController.getAllProjects);
app.get("/projects/:projectId", projectController.getProjectById);
app.get(
  "/projects/:projectId/samples/:sampleId",
  projectController.getSampleById
);
app.put("/projects/:projectId", projectController.updateProject);
app.delete(
  "/projects/:projectId/samples/:sampleId",
  projectController.deleteSample
);
app.delete("/projects/:projectId", projectController.deleteProjectByRole);
app.post(
  "/projects/:projectId/reports/draft",
  projectController.saveFinalReportDraft
);
app.post(
  "/projects/:projectId/reports/publish",
  projectController.publishFinalReport
);
app.get(
  "/projects/:projectId/reports/versions",
  projectController.getReportVersions
);
app.get(
  "/projects/:projectId/reports/versions/:versionId",
  projectController.getReportVersion
);
app.post("/projects/:projectId/reports/upload", projectController.uploadReport);

const mockFileMiddleware = (req, res, next) => {
  if (req.body.mockFile) {
    req.file = {
      originalname: "test-protocol.pdf",
      path: "/uploads/test-protocol.pdf",
      mimetype: "application/pdf",
    };
  }
  next();
};

app.post(
  "/projects/:projectId/samples",
  mockFileMiddleware,
  projectController.addSampleToProject
);

describe("Project Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create Project", () => {
    it("should create a new project successfully", async () => {
      jest.spyOn(Project, "findOne").mockResolvedValue(null);
      jest.spyOn(Project.prototype, "save").mockResolvedValue();

      const mockProjectData = {
        projectName: "Test Project",
        researchDomains: ["Biology", "Chemistry"],
        teamLead: "leadUserId",
        fundingSource: "Research Grant",
        budget: 10000,
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        status: "Active",
        collaboratingInstitutions: ["University A", "University B"],
        description: "A test project description",
        expectedOutcomes: "Expected research outcomes",
        teamMembers: ["member1", "member2"],
      };

      const response = await request(app)
        .post("/projects")
        .send(mockProjectData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Project created successfully");
      expect(Project.prototype.save).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalled();
      expect(createNotificationForUsers).toHaveBeenCalled();
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteProjectData = {
        projectName: "Test Project",
      };

      const response = await request(app)
        .post("/projects")
        .send(incompleteProjectData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
    });

    it("should return 400 if project already exists", async () => {
      jest
        .spyOn(Project, "findOne")
        .mockResolvedValue({ name: "Test Project" });

      const mockProjectData = {
        name: "Test Project",
        projectName: "Test Project",
        researchDomains: ["Biology"],
        teamLead: "leadUserId",
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        description: "Test description",
      };

      const response = await request(app)
        .post("/projects")
        .send(mockProjectData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Project already exists");
    });

    it("should handle errors during project creation", async () => {
      jest.spyOn(Project, "findOne").mockResolvedValue(null);
      jest
        .spyOn(Project.prototype, "save")
        .mockRejectedValue(new Error("Database Error"));

      const mockProjectData = {
        projectName: "Test Project",
        researchDomains: ["Biology"],
        teamLead: "leadUserId",
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        description: "Test description",
      };

      const response = await request(app)
        .post("/projects")
        .send(mockProjectData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to create project");
    });
  });

  describe("Add Sample to Project", () => {
    it("should add a sample to a project successfully", async () => {
      const mockProject = {
        _id: "mockProjectId",
        teamLead: "teamLeadId",
        teamMembers: ["member1", "member2"],
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);
      jest.spyOn(Sample.prototype, "save").mockResolvedValue();
      jest.spyOn(Project, "findByIdAndUpdate").mockResolvedValue({});

      const mockSampleData = {
        sampleData: JSON.stringify({
          name: "Test Sample",
          description: "A test sample",
          type: "Blood",
          quantity: 10,
          unit: "ml",
          collectionDate: "2025-01-15",
          technicianResponsible: "techId",
          expirationDate: "2025-12-31",
          identification: "SAMPLE-001",
        }),
        mockFile: true,
      };

      const response = await request(app)
        .post("/projects/mockProjectId/samples")
        .send(mockSampleData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Sample added successfully");
      expect(Sample.prototype.save).toHaveBeenCalled();
      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        "mockProjectId",
        expect.objectContaining({
          $push: expect.any(Object),
        })
      );
      expect(createNotification).toHaveBeenCalled();
      expect(createNotificationForUsers).toHaveBeenCalled();
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app)
        .post("/projects/nonexistentId/samples")
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Project not found");
    });

    it("should handle errors when adding a sample", async () => {
      const mockProject = {
        _id: "mockProjectId",
        teamLead: "teamLeadId",
        teamMembers: ["member1", "member2"],
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);
      jest
        .spyOn(Sample.prototype, "save")
        .mockRejectedValue(new Error("Database Error"));

      const mockSampleData = {
        sampleData: JSON.stringify({
          name: "Test Sample",
          description: "A test sample",
          type: "Blood",
          quantity: 10,
          unit: "ml",
          collectionDate: "2025-01-15",
          technicianResponsible: "techId",
          expirationDate: "2025-12-31",
          identification: "SAMPLE-001",
        }),
      };

      const response = await request(app)
        .post("/projects/mockProjectId/samples")
        .send(mockSampleData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database Error");
    });
  });

  describe("Get Samples By Project", () => {
    it("should return all samples for a project", async () => {
      const mockSamples = [
        { id: "sample1", name: "Sample 1" },
        { id: "sample2", name: "Sample 2" },
      ];

      jest.spyOn(Sample, "find").mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSamples),
      });

      const response = await request(app).get(
        "/projects/mockProjectId/samples"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSamples);
      expect(Sample.find).toHaveBeenCalledWith({ project: "mockProjectId" });
    });

    it("should handle errors when fetching samples", async () => {
      jest.spyOn(Sample, "find").mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("Database Error")),
      });

      const response = await request(app).get(
        "/projects/mockProjectId/samples"
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database Error");
    });
  });

  describe("Get Sample By ID", () => {
    it("should return a sample by ID with populated fields", async () => {
      const mockSample = {
        _id: "sampleId",
        name: "Test Sample",
        description: "A test sample",
        technicianResponsible: {
          _id: "technicianId",
          name: "John Doe",
          email: "johndoe@example.com",
          institution: "Tech Institute",
        },
        project: {
          _id: "projectId",
          projectName: "Project X",
          researchDomain: "Biology",
        },
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSample),
      };

      jest.spyOn(Sample, "findById").mockReturnValue(mockQuery);

      const response = await request(app).get(
        "/projects/mockProjectId/samples/sampleId"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSample);
      expect(Sample.findById).toHaveBeenCalledWith("sampleId");
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "technicianResponsible",
        "name email institution"
      );
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "project",
        "projectName researchDomain"
      );
    });

    it("should return 404 if sample is not found", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      jest.spyOn(Sample, "findById").mockReturnValue(mockQuery);

      const response = await request(app).get(
        "/projects/mockProjectId/samples/nonexistentId"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Sample not found");
    });

    it("should handle errors when fetching a sample", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error("Database Error")),
      };

      jest.spyOn(Sample, "findById").mockReturnValue(mockQuery);

      const response = await request(app).get(
        "/projects/mockProjectId/samples/sampleId"
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database Error");
    });
  });

  describe("Get All Projects", () => {
    it("should return all projects for the user with progress calculation", async () => {
      const mockProjects = [
        {
          _id: "project1",
          projectName: "Project 1",
          samples: [{ status: "Analyzed" }, { status: "Pending" }],
        },
        {
          _id: "project2",
          projectName: "Project 2",
          samples: [
            { status: "Analyzed" },
            { status: "Analyzed" },
            { status: "Analyzed" },
            { status: "Pending" },
          ],
        },
      ];

      jest.spyOn(Project, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockProjects),
      });

      const response = await request(app).get("/projects");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].progress).toBe(50);
      expect(response.body[1].progress).toBe(75);
    });

    it("should handle errors when fetching projects", async () => {
      jest.spyOn(Project, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error("Database Error")),
      });

      const response = await request(app).get("/projects");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe(
        "Erreur serveur lors de la récupération des projets"
      );
    });
  });

  describe("Get Project By ID", () => {
    it("should return a project with progress calculation", async () => {
      const mockProject = {
        _id: "project1",
        projectName: "Project 1",
        samples: [{ status: "Analyzed" }, { status: "Pending" }],
      };

      jest.spyOn(Project, "findById").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      });

      const response = await request(app).get("/projects/project1");

      expect(response.status).toBe(200);
      expect(response.body.project.progress).toBe(50);
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app).get("/projects/nonexistentId");
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Projet non trouvé");
    });

    it("should handle errors when fetching a project", async () => {
      jest.spyOn(Project, "findById").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error("Database Error")),
      });

      const response = await request(app).get("/projects/project1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to fetch project details");
    });
  });

  describe("Update Project", () => {
    it("should update a project successfully", async () => {
      const mockProject = {
        _id: "mockProjectId",
        save: jest.fn().mockResolvedValue({}),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const updatedProjectData = {
        projectName: "Updated Project",
        researchDomains: ["Biology", "Physics"],
        teamLead: "leadUserId",
        fundingSource: "Updated Grant",
        budget: 15000,
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        status: "Active",
        collaboratingInstitutions: ["University A", "University C"],
        description: "Updated description",
        expectedOutcomes: "Updated outcomes",
        teamMembers: ["member1", "member3"],
      };

      const response = await request(app)
        .put("/projects/mockProjectId")
        .send(updatedProjectData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Project updated successfully");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteProjectData = {
        projectName: "Updated Project",
      };

      const response = await request(app)
        .put("/projects/mockProjectId")
        .send(incompleteProjectData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const updatedProjectData = {
        projectName: "Updated Project",
        researchDomains: ["Biology"],
        teamLead: "leadUserId",
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/projects/nonexistentId")
        .send(updatedProjectData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should handle errors during project update", async () => {
      const mockProject = {
        _id: "mockProjectId",
        save: jest.fn().mockRejectedValue(new Error("Database Error")),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const updatedProjectData = {
        projectName: "Updated Project",
        researchDomains: ["Biology"],
        teamLead: "leadUserId",
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/projects/mockProjectId")
        .send(updatedProjectData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to update project");
    });
  });

  describe("Delete Sample", () => {
    it("should return 404 if sample is not found", async () => {
      jest.spyOn(Sample, "findByIdAndDelete").mockResolvedValue(null);

      const response = await request(app).delete(
        "/projects/mockProjectId/samples/nonexistentId"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Sample not found");
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Sample, "findByIdAndDelete").mockResolvedValue({
        _id: "sampleId",
      });
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app).delete(
        "/projects/nonexistentId/samples/sampleId"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Project not found");
    });

    it("should handle errors when deleting a sample", async () => {
      jest
        .spyOn(Sample, "findByIdAndDelete")
        .mockRejectedValue(new Error("Database Error"));

      const response = await request(app).delete(
        "/projects/mockProjectId/samples/sampleId"
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to delete sample");
    });
  });

  describe("Delete Project By Role", () => {
    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app).delete("/projects/nonexistentId");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Project not found");
    });

    it("should return 403 if user is not the creator", async () => {
      const mockProject = {
        _id: "mockProjectId",
        createdBy: "differentUserId",
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).delete("/projects/mockProjectId");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Forbidden");
    });

    it("should handle errors when deleting a project", async () => {
      jest
        .spyOn(Project, "findById")
        .mockRejectedValue(new Error("Database Error"));

      const response = await request(app).delete("/projects/mockProjectId");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to delete project");
    });
  });

  describe("Final Report Operations", () => {
    it("should save a draft report successfully", async () => {
      const mockProject = {
        _id: "mockProjectId",
        save: jest.fn().mockResolvedValue({}),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "<p>Draft report content</p>",
        publishedAt: null,
      };

      const response = await request(app)
        .post("/projects/mockProjectId/reports/draft")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Draft saved successfully");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should publish a final report successfully", async () => {
      const mockProject = {
        _id: "mockProjectId",
        save: jest.fn().mockResolvedValue({}),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "<p>Final report content</p>",
        publishedAt: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/projects/mockProjectId/reports/publish")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Final report published successfully");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should get report versions successfully", async () => {
      const mockProject = {
        _id: "mockProjectId",
        reportVersions: [
          { _id: "version1", content: "Version 1" },
          { _id: "version2", content: "Version 2" },
        ],
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).get(
        "/projects/mockProjectId/reports/versions"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProject.reportVersions);
    });

    it("should get a specific report version", async () => {
      const mockVersion = { _id: "version1", content: "Version 1" };
      const mockProject = {
        _id: "mockProjectId",
        reportVersions: {
          id: jest.fn().mockReturnValue(mockVersion),
        },
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).get(
        "/projects/mockProjectId/reports/versions/version1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockVersion);
    });

    it("should upload a report successfully", async () => {
      const mockProject = {
        _id: "mockProjectId",
        save: jest.fn().mockResolvedValue({}),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/mockProjectId/reports/upload")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Report uploaded successfully");
      expect(mockProject.save).toHaveBeenCalled();
    });
  });
});
