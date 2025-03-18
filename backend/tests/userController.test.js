const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const userController = require("../controllers/userController");
const User = require("../models/User");
const Project = require("../models/Project");
const mongoose = require("mongoose");

const authMiddleware = (req, res, next) => {
  req.user = {
    _id: "507f1f77bcf86cd799439011",
    id: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    role: "admin",
  };
  next();
};

const app = express();
app.use(bodyParser.json());
app.use(authMiddleware);

app.get(
  "/project/available-team-members",
  userController.getAvailableTeamMembers
);
app.get(
  "/project/available-technicians",
  userController.getAvailableTechnicians
);
app.delete(
  "/projects/:projectId/team-members/:userId",
  userController.deleteMemberFromProject
);

describe("User Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get Available Team Members", () => {
    it("should return all users with role 'chercheur'", async () => {
      const mockChercheurs = [
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Researcher 1",
          email: "researcher1@example.com",
          role: "chercheur",
        },
        {
          _id: "507f1f77bcf86cd799439012",
          name: "Researcher 2",
          email: "researcher2@example.com",
          role: "chercheur",
        },
      ];

      jest.spyOn(User, "find").mockResolvedValue(mockChercheurs);

      const response = await request(app).get(
        "/project/available-team-members"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockChercheurs);
      expect(User.find).toHaveBeenCalledWith({ role: "chercheur" });
    });

    it("should return an empty array if no users with role 'chercheur' found", async () => {
      jest.spyOn(User, "find").mockResolvedValue([]);

      const response = await request(app).get(
        "/project/available-team-members"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(User.find).toHaveBeenCalledWith({ role: "chercheur" });
    });

    it("should handle errors when fetching team members", async () => {
      jest.spyOn(User, "find").mockRejectedValue(new Error("Database Error"));

      const response = await request(app).get(
        "/project/available-team-members"
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database Error");
    });
  });

  describe("Get Available Technicians", () => {
    it("should return all users with role 'technicien'", async () => {
      const mockTechnicians = [
        {
          _id: "507f1f77bcf86cd799439013",
          name: "Technician 1",
          email: "technician1@example.com",
          role: "technicien",
        },
        {
          _id: "507f1f77bcf86cd799439014",
          name: "Technician 2",
          email: "technician2@example.com",
          role: "technicien",
        },
      ];

      jest.spyOn(User, "find").mockResolvedValue(mockTechnicians);

      const response = await request(app).get("/project/available-technicians");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTechnicians);
      expect(User.find).toHaveBeenCalledWith({ role: "technicien" });
    });

    it("should return an empty array if no users with role 'technicien' found", async () => {
      jest.spyOn(User, "find").mockResolvedValue([]);

      const response = await request(app).get("/project/available-technicians");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(User.find).toHaveBeenCalledWith({ role: "technicien" });
    });

    it("should handle errors when fetching technicians", async () => {
      jest.spyOn(User, "find").mockRejectedValue(new Error("Database Error"));

      const response = await request(app).get("/project/available-technicians");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database Error");
    });
  });

  // Tests for deleteMemberFromProject

});
