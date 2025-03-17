const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const {
  createNotification,
  createNotificationForUsers,
} = require("../controllers/NotificationsController");

// get all samples by id of the technician
exports.getAllSamples = async (req, res) => {
  try {
    const samples = await Sample.find({
      technician: req.params.id,
    })
      .populate("createdBy", "name email")
      .populate("project", "projectName teamLead teamMembers"); // Make sure to populate project
    res.json(samples);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update the status of a sample
exports.updateSampleStatus = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { status } = req.body;

    // Check if status is valid
    const validStatuses = ["In Analysis", "Analyzed"]; // Update to match your schema's enum values
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find the sample and populate the project
    const sample = await Sample.findById(sampleId).populate("project");
    
    if (!sample) {
      return res.status(404).json({ message: "Sample not found" });
    }

    // Check if status is already correct
    if (sample.status === status) {
      return res.status(400).json({ message: "Sample already in this status" });
    }

    // Update the status
    sample.status = status;
    await sample.save();

    // Create notification for the creator
    const notificationMessage =
      status === "In Analysis"
        ? "L'analyse de l'échantillon a commencé"
        : "L'analyse de l'échantillon est terminée";

    await createNotification(
      req.user._id,
      notificationMessage,
      sample._id,
      sample.project._id // Use project instead of relatedProject
    );

    // Notify team members
    const usersToNotify = [
      sample.project.teamLead,
      ...sample.project.teamMembers,
    ]
      .filter((userId) => userId.toString() !== req.user._id.toString())
      .filter(Boolean);

    if (usersToNotify.length > 0) {
      await createNotificationForUsers(
        usersToNotify,
        `Mise à jour de l'échantillon: ${status}`,
        sample._id,
        sample.project._id, // Use project instead of relatedProject
        "Info",
        "Échantillon mis à jour"
      );
    }

    res
      .status(200)
      .json({ message: "Sample status updated successfully", sample });
  } catch (error) {
    console.error("Error updating sample status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};