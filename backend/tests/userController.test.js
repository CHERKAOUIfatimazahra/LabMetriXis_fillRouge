// const {
//   getAvailableTeamMembers,
//   getAvailableTechnicians,
//   deleteMemberFromProject,
// } = require("../controllers/userController");
// const User = require("../models/User");
// const Project = require("../models/Project");

// jest.mock("../models/User");
// jest.mock("../models/Project");

// describe("Controller tests", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("getAvailableTeamMembers", () => {
//     it("should return all chercheurs", async () => {
//       const mockUsers = [
//         { _id: "1", name: "User 1", role: "chercheur" },
//         { _id: "2", name: "User 2", role: "chercheur" },
//       ];

//       // Mock the User.find method
//       User.find.mockResolvedValue(mockUsers);

//       const req = {};
//       const res = {
//         json: jest.fn(),
//       };

//       await getAvailableTeamMembers(req, res);

//       expect(User.find).toHaveBeenCalledWith({ role: "chercheur" });
//       expect(res.json).toHaveBeenCalledWith(mockUsers);
//     });

//     it("should handle errors", async () => {
//       User.find.mockRejectedValue(new Error("Database error"));

//       const req = {};
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await getAvailableTeamMembers(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
//     });
//   });

//   describe("getAvailableTechnicians", () => {
//     it("should return all technicians", async () => {
//       const mockUsers = [
//         { _id: "1", name: "Tech 1", role: "technicien" },
//         { _id: "2", name: "Tech 2", role: "technicien" },
//       ];

//       // Mock the User.find method
//       User.find.mockResolvedValue(mockUsers);

//       const req = {};
//       const res = {
//         json: jest.fn(),
//       };

//       await getAvailableTechnicians(req, res);

//       expect(User.find).toHaveBeenCalledWith({ role: "technicien" });
//       expect(res.json).toHaveBeenCalledWith(mockUsers);
//     });

//     it("should handle errors", async () => {
//       User.find.mockRejectedValue(new Error("Database error"));

//       const req = {};
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await getAvailableTechnicians(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
//     });
//   });

//   describe("deleteMemberFromProject", () => {
//     it("should remove a member from project", async () => {
//       const mockProject = {
//         _id: "projectId",
//         teamMembers: [
//           {
//             user: { _id: "memberId" },
//             name: "User 1",
//             email: "user1@example.com",
//           },
//         ],
//         teamLead: { _id: "teamLeadId", name: "Team Lead" },
//       };

//       Project.findById.mockResolvedValue(mockProject);
//       Project.findById.mockResolvedValueOnce(mockProject); // Mock for the updated project

//       const req = {
//         params: { projectId: "projectId", memberId: "memberId" },
//         user: { _id: "teamLeadId" },
//       };
//       const res = {
//         json: jest.fn(),
//       };

//       await deleteMemberFromProject(req, res);

//       expect(Project.findById).toHaveBeenCalledWith("projectId");
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Team member removed successfully",
//         project: mockProject,
//       });
//     });

//     it("should return 404 if project is not found", async () => {
//       Project.findById.mockResolvedValue(null);

//       const req = {
//         params: { projectId: "invalidProjectId", memberId: "memberId" },
//         user: { _id: "teamLeadId" },
//       };
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await deleteMemberFromProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(404);
//       expect(res.json).toHaveBeenCalledWith({ message: "Project not found" });
//     });

//     it("should return 403 if user is not the team lead", async () => {
//       const mockProject = {
//         _id: "projectId",
//         teamMembers: [{ user: { _id: "memberId" } }],
//         teamLead: { _id: "teamLeadId", name: "Team Lead" },
//       };

//       Project.findById.mockResolvedValue(mockProject);

//       const req = {
//         params: { projectId: "projectId", memberId: "memberId" },
//         user: { _id: "differentUserId" },
//       };
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await deleteMemberFromProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(403);
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Only team leader can remove members",
//       });
//     });

//     it("should return 404 if team member is not found", async () => {
//       const mockProject = {
//         _id: "projectId",
//         teamMembers: [{ user: { _id: "otherMemberId" } }],
//         teamLead: { _id: "teamLeadId", name: "Team Lead" },
//       };

//       Project.findById.mockResolvedValue(mockProject);

//       const req = {
//         params: { projectId: "projectId", memberId: "nonExistingMemberId" },
//         user: { _id: "teamLeadId" },
//       };
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await deleteMemberFromProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(404);
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Team member not found",
//       });
//     });

//     it("should handle errors", async () => {
//       Project.findById.mockRejectedValue(new Error("Database error"));

//       const req = {
//         params: { projectId: "projectId", memberId: "memberId" },
//         user: { _id: "teamLeadId" },
//       };
//       const res = {
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn(),
//       };

//       await deleteMemberFromProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Internal server error",
//       });
//     });
//   });
// });
