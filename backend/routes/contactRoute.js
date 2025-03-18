const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactusController");

router.post("/contactus", contactController.contactUs);

module.exports = router;