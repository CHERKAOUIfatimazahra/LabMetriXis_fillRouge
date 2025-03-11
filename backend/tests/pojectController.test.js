// const mongoose = require("mongoose");
// const Project = require("../models/Project");
// const User = require("../models/User");
// const Sample = require("../models/Sample");
// const {
//   createProject,
//   updateProject,
//   getProjectById,
//   getAllProjects,
//   deleteSample,
//   deleteProjectByRole,
// } = require("../controllers/projectController");

// // Mock the request and response objects
// const mockRequest = (body = {}, params = {}, user = {}) => ({
//   body,
//   params,
//   user,
// });

// const mockResponse = () => {
//   const res = {};
//   res.status = jest.fn().mockReturnValue(res);
//   res.json = jest.fn().mockReturnValue(res);
//   return res;
// };

// describe("Project Controller Tests", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("createProject", () => {
//     it("should create a project successfully", async () => {
//       const req = mockRequest(
//         {
//           projectName: "Test Project",
//           researchDomains: "Biology",
//           teamLead: "leadId",
//           startDate: "2024-01-01",
//           deadline: "2024-12-31",
//           description: "Test description",
//           teamMembers: ["member1", "member2"],
//         },
//         {},
//         { _id: "userId" }
//       );
//       const res = mockResponse();

//       Project.prototype.save = jest.fn().mockResolvedValue({
//         _id: "projectId",
//         projectName: "Test Project",
//       });

//       await createProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           message: "Project created successfully",
//         })
//       );
//     });

//     it("should return 400 when required fields are missing", async () => {
//       const req = mockRequest({
//         projectName: "Test Project",
//       });
//       const res = mockResponse();

//       await createProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Missing required fields",
//       });
//     });
//   });

//   describe("updateProject", () => {
//     it("should update a project successfully", async () => {
//       const req = mockRequest(
//         {
//           projectName: "Updated Project",
//           researchDomains: "Biology",
//           teamLead: "leadId",
//           startDate: "2024-01-01",
//           deadline: "2024-12-31",
//           description: "Updated description",
//           teamMembers: ["member1", "member2"],
//         },
//         { projectId: "projectId" }
//       );
//       const res = mockResponse();

//       const mockProject = {
//         save: jest.fn().mockResolvedValue(true),
//       };
//       Project.findById = jest.fn().mockResolvedValue(mockProject);

//       await updateProject(req, res);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           message: "Project updated successfully",
//         })
//       );
//     });
//   });

//   describe("getProjectById", () => {
//     it("should return project with calculated progress", async () => {
//       const mockProject = {
//         _id: "projectId",
//         samples: [{ status: "Analyzed" }, { status: "Pending" }],
//       };

//       Project.findById = jest.fn().mockReturnValue({
//         populate: jest.fn().mockReturnValue({
//           populate: jest.fn().mockReturnValue({
//             lean: jest.fn().mockReturnValue({
//               exec: jest.fn().mockResolvedValue(mockProject),
//             }),
//           }),
//         }),
//       });

//       const req = mockRequest({}, { projectId: "projectId" });
//       const res = mockResponse();

//       await getProjectById(req, res);

//       expect(res.json).toHaveBeenCalledWith({
//         project: expect.objectContaining({
//           progress: 50, // 1 analyzed out of 2 samples
//         }),
//       });
//     });
//   });
// });
