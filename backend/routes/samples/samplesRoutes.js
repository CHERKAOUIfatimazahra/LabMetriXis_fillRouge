const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/authMiddleware");
const sampleController = require("../../controllers/sampleController");

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


// Sample routes

// get all samples by id of the technician
router.get(
  "/samples",
  verifyToken,
  sampleController.getAllSamples
);

// update the status of the sample 
router.patch(
  "/samples/:sampleId/status",
  verifyToken,
  sampleController.updateSampleStatus
);

// Soumettre un rapport d'analyse
router.post(
  "/samples/:sampleId/analysis-report",
  verifyToken,
  sampleController.submitAnalysisReport
);

// Récupérer un rapport d'analyse
router.get(
  "/samples/:sampleId/analysis-report",
  verifyToken,
  sampleController.getAnalysisReport
);

module.exports = router;