const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// get all samples by id of the technician
exports.getAllSamples = async (req, res) => {
    try {
        const samples = await Sample.find({
          technician: req.params.id,
        })
          .populate("createdBy", "name email")
          .populate("project", "projectName teamLead")
        res.json(samples);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

