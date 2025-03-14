const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/authMiddleware");
const { isChercheur } = require("../../middleware/roleMiddleware");
const projectController = require("../../controllers/projectController");
const userController = require("../../controllers/userController");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});
const upload = multer({ storage: storage });

// get users and user by id
router.get(
  "/available-team-members",
  verifyToken,
  userController.getAvailableTeamMembers
);

router.get(
  "/available-technicians",
  verifyToken,
  userController.getAvailableTechnicians
);

// Project routes
router.post(
  "/project",
  verifyToken,
  isChercheur,
  projectController.createProject
);

// Sample routes
router.post(
  "/projects/:projectId/samples",
  verifyToken,
  isChercheur,
  upload.single("protocolFile"),
  projectController.addSampleToProject
);

router.get(
  "/projects/:projectId/samples",
  verifyToken,
  projectController.getSamplesByProject
);

// Get all projects
router.get(
  "/projects",
  verifyToken,
  isChercheur,
  projectController.getAllProjects
);

// get project by id
router.get(
  "/projects/:projectId",
  verifyToken,
  projectController.getProjectById
);

// update project
router.put(
  "/projects/:projectId",
  verifyToken,
  isChercheur,
  projectController.updateProject
);

// delete sample
router.delete(
  "/projects/:projectId/samples/:sampleId",
  verifyToken,
  isChercheur,
  projectController.deleteSample
);

// deleteProjectByRole
router.delete(
  "/projects/:projectId",
  verifyToken,
  isChercheur,
  projectController.deleteProjectByRole
);

// delete memebre from project by team leader
router.delete(
  "/projects/:projectId/team-members/:userId",
  verifyToken,
  isChercheur,
  userController.deleteMemberFromProject
);

// Final report routes
router.patch(
  "/projects/:projectId/final-report-draft",
  verifyToken,
  isChercheur,
  projectController.saveFinalReportDraft
);

router.patch(
  "/projects/:projectId/final-report",
  verifyToken,
  isChercheur,
  projectController.publishFinalReport
);

router.get(
  "/projects/:projectId/report-versions",
  verifyToken,
  isChercheur,
  projectController.getReportVersions
);

router.get(
  "/projects/:projectId/report-versions/:versionId",
  verifyToken,
  isChercheur,
  projectController.getReportVersion
);

router.post(
  "/projects/:projectId/upload-report",
  verifyToken,
  isChercheur,
  projectController.uploadReport
);

// get sample by id
router.get("/projects/samples/:sampleId",
  verifyToken,
  projectController.getSampleById);

// update sample by id
router.put("/projects/samples/:sampleId",
  verifyToken,upload.single('protocolFile'),
  projectController.updateSample);


module.exports = router;
