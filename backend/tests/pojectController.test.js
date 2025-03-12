const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const projectController = require("../controllers/projectController");
const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");
const mongoose = require("mongoose");

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
    });

    it("should handle errors when adding a sample", async () => {
 
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
        _id: "project1",
        projectName: "Old Name",
        save: jest.fn().mockResolvedValue(),
      };


      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const updateData = {
        projectName: "Updated Project",
        researchDomains: ["Biology", "Chemistry"],
        teamLead: "leadUserId",
        fundingSource: "Research Grant",
        budget: 15000,
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        status: "Active",
        collaboratingInstitutions: ["University A", "University B"],
        description: "Updated description",
        expectedOutcomes: "Updated outcomes",
        teamMembers: ["member1", "member2", "member3"],
      };

      const response = await request(app)
        .put("/projects/project1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Project updated successfully");
      expect(mockProject.projectName).toBe("Updated Project");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteUpdateData = {
        projectName: "Updated Project",
     
      };

      const response = await request(app)
        .put("/projects/project1")
        .send(incompleteUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
    });

    it("should return 404 if project is not found", async () => {
  
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const updateData = {
        projectName: "Updated Project",
        researchDomains: ["Biology"],
        teamLead: "leadUserId",
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/projects/nonexistentId")
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should handle errors during project update", async () => {
      const mockProject = {
        _id: "project1",
        save: jest.fn().mockRejectedValue(new Error("Database Error")),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const updateData = {
        projectName: "Updated Project",
        researchDomains: ["Biology"],
        teamLead: "leadUserId",
        startDate: "2025-01-01",
        deadline: "2025-12-31",
        description: "Updated description",
      };

      const response = await request(app)
        .put("/projects/project1")
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to update project");
    });
  });

  describe("Delete Sample", () => {
    it("should delete a sample successfully", async () => {

      jest.spyOn(Sample, "findByIdAndDelete").mockResolvedValue({
        _id: "sample1",
        name: "Test Sample",
      });

      const mockProject = {
        _id: "project1",
        samples: [{ _id: new mongoose.Types.ObjectId().toString() }],
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      jest
        .spyOn(Project, "findById")
        .mockReturnValueOnce(mockProject)
        .mockReturnValueOnce({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue({ _id: "project1", samples: [] }),
        });

      const response = await request(app).delete(
        "/projects/project1/samples/sample1"
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Sample deleted successfully");
      expect(Sample.findByIdAndDelete).toHaveBeenCalledWith("sample1");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should return 404 if sample is not found", async () => {

      jest.spyOn(Sample, "findByIdAndDelete").mockResolvedValue(null);

      const response = await request(app).delete(
        "/projects/project1/samples/nonexistentId"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Sample not found");
    });

    it("should return 404 if project is not found", async () => {

      jest.spyOn(Sample, "findByIdAndDelete").mockResolvedValue({
        _id: "sample1",
        name: "Test Sample",
      });

      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app).delete(
        "/projects/nonexistentId/samples/sample1"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Project not found");
    });

    it("should handle errors when deleting a sample", async () => {
      jest
        .spyOn(Sample, "findByIdAndDelete")
        .mockRejectedValue(new Error("Database Error"));

      const response = await request(app).delete(
        "/projects/project1/samples/sample1"
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to delete sample");
    });
  });

  describe("Delete Project By Role", () => {
    it("should delete a project successfully", async () => {
      const mockProject = {
        _id: "project1",
        createdBy: "mockUserId",
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      jest.spyOn(Project, "findByIdAndDelete").mockResolvedValue(mockProject);

      const mockUser = {
        _id: "mockUserId",
        projects: [
          { _id: new mongoose.Types.ObjectId("60fbd6b8b8d3b2345b5f473f") },
        ],
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(User, "findById").mockResolvedValue(mockUser);

      const response = await request(app).delete("/projects/project1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Project deleted successfully");
      expect(Project.findByIdAndDelete).toHaveBeenCalledWith("project1");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app).delete("/projects/nonexistentId");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Project not found");
    });

    it("should return 403 if user is not the creator", async () => {
      const mockProject = {
        _id: "project1",
        createdBy: "differentUserId",
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).delete("/projects/project1");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Forbidden");
    });

    it("should handle errors when deleting a project", async () => {

      jest
        .spyOn(Project, "findById")
        .mockRejectedValue(new Error("Database Error"));

      const response = await request(app).delete("/projects/project1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to delete project");
    });
  });

  describe("Save Final Report Draft", () => {
    it("should save a report draft successfully", async () => {
      const mockProject = {
        _id: "project1",
        reportVersions: [],
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Draft report content",
        publishedAt: null,
      };

      const response = await request(app)
        .post("/projects/project1/reports/draft")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Draft saved successfully");
      expect(mockProject.reportVersions.length).toBe(1);
      expect(mockProject.finalReport.status).toBe("draft");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should return 404 if project is not found", async () => {

      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const reportData = {
        content: "Draft report content",
        publishedAt: null,
      };

      const response = await request(app)
        .post("/projects/nonexistentId/reports/draft")
        .send(reportData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should handle errors when saving a draft", async () => {
      const mockProject = {
        _id: "project1",
        reportVersions: [],
        save: jest.fn().mockRejectedValue(new Error("Database Error")),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Draft report content",
        publishedAt: null,
      };

      const response = await request(app)
        .post("/projects/project1/reports/draft")
        .send(reportData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to save draft");
    });
  });

  describe("Publish Final Report", () => {
    it("should publish a final report successfully", async () => {
      const mockProject = {
        _id: "project1",
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Final report content",
        publishedAt: "2025-03-15",
      };

      const response = await request(app)
        .post("/projects/project1/reports/publish")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Final report published successfully");
      expect(mockProject.finalReport.status).toBe("published");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const reportData = {
        content: "Final report content",
        publishedAt: "2025-03-15",
      };

      const response = await request(app)
        .post("/projects/nonexistentId/reports/publish")
        .send(reportData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should handle errors when publishing a report", async () => {
      const mockProject = {
        _id: "project1",
        save: jest.fn().mockRejectedValue(new Error("Database Error")),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Final report content",
        publishedAt: "2025-03-15",
      };

      const response = await request(app)
        .post("/projects/project1/reports/publish")
        .send(reportData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to publish report");
    });
  });

  describe("Get Report Versions", () => {
    it("should return all report versions", async () => {
      const mockProject = {
        _id: "project1",
        reportVersions: [
          { _id: "version1", content: "Version 1", createdAt: new Date() },
          { _id: "version2", content: "Version 2", createdAt: new Date() },
        ],
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).get(
        "/projects/project1/reports/versions"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app).get(
        "/projects/nonexistentId/reports/versions"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should handle errors when fetching versions", async () => {
      jest
        .spyOn(Project, "findById")
        .mockRejectedValue(new Error("Database Error"));

      const response = await request(app).get(
        "/projects/project1/reports/versions"
      );

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to fetch versions");
    });
  });

  describe("Get Report Version", () => {
    it("should return a specific report version", async () => {
      const mockVersion = {
        _id: "version1",
        content: "Version 1 content",
        createdAt: new Date().toISOString(),
      };

      const mockProject = {
        _id: "project1",
        reportVersions: {
          id: jest.fn().mockReturnValue(mockVersion),
        },
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).get(
        "/projects/project1/reports/versions/version1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockVersion);
    });

    it("should return 404 if project is not found", async () => {
      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const response = await request(app).get(
        "/projects/nonexistentId/reports/versions/version1"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should return 404 if version is not found", async () => {
      const mockProject = {
        _id: "project1",
        reportVersions: {
          id: jest.fn().mockReturnValue(null),
        },
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const response = await request(app).get(
        "/projects/project1/reports/versions/nonexistentVersion"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Version not found");
    });

    it("should handle errors when fetching a version", async () => {
      jest
        .spyOn(Project, "findById")
        .mockRejectedValue(new Error("Database Error"));

      const response = await request(app).get(
        "/projects/project1/reports/versions/version1"
      );

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to fetch version");
    });
  });

  describe("Upload Report", () => {
    it("should upload a report successfully", async () => {
      const mockProject = {
        _id: "project1",
        reportVersions: [],
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/project1/reports/upload")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Report uploaded successfully");
      expect(mockProject.reportVersions.length).toBe(1);
      expect(mockProject.reportVersions[0].content).toBe(
        "Uploaded report content"
      );
      expect(mockProject.reportVersions[0].type).toBe("upload");
      expect(mockProject.finalReport.status).toBe("draft");
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should handle the case when reportVersions array doesn't exist", async () => {
      const mockProject = {
        _id: "project1",
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/project1/reports/upload")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Report uploaded successfully");
      expect(mockProject.reportVersions).toBeDefined();
      expect(mockProject.reportVersions.length).toBe(1);
      expect(mockProject.save).toHaveBeenCalled();
    });

    it("should return 404 if project is not found", async () => {

      jest.spyOn(Project, "findById").mockResolvedValue(null);

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/nonexistentId/reports/upload")
        .send(reportData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Project not found");
    });

    it("should handle errors when uploading a report", async () => {

      jest
        .spyOn(Project, "findById")
        .mockRejectedValue(new Error("Database Error"));

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/project1/reports/upload")
        .send(reportData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Failed to upload report");
    });

    it("should include createdBy user ID in the report version", async () => {
      const mockProject = {
        _id: "project1",
        reportVersions: [],
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/project1/reports/upload")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(mockProject.reportVersions[0].createdBy).toBe("mockUserId");
    });

    it("should set correct timestamp in the report version", async () => {
      const mockDate = new Date("2025-03-12T10:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      const mockProject = {
        _id: "project1",
        reportVersions: [],
        save: jest.fn().mockResolvedValue(),
      };

      jest.spyOn(Project, "findById").mockResolvedValue(mockProject);

      const reportData = {
        content: "Uploaded report content",
      };

      const response = await request(app)
        .post("/projects/project1/reports/upload")
        .send(reportData);

      expect(response.status).toBe(200);
      expect(mockProject.reportVersions[0].createdAt).toEqual(mockDate);
      expect(mockProject.finalReport.lastModified).toEqual(mockDate);

      global.Date.mockRestore();
    });
  });
});
