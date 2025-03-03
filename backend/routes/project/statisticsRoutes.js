const express = require("express");
const statisticController = require("../../controllers/statisticsController");
const router = express.Router();
const { verifyToken } = require("../../middleware/authMiddleware");

router.get("/statistic", verifyToken, statisticController.getStatistics);

module.exports = router;
