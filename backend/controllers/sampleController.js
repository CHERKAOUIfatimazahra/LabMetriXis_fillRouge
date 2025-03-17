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

// Dans sampleController.js, ajoutez cette fonction
exports.submitAnalysisReport = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { analysisReport } = req.body;

    // Vérifier que l'ID de l'échantillon est valide
    if (!sampleId) {
      return res.status(400).json({ error: "ID d'échantillon invalide" });
    }

    // Trouver l'échantillon
    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ error: "Échantillon non trouvé" });
    }

    // Vérifier que l'utilisateur est bien le technicien responsable de cet échantillon
    if (sample.technicianResponsible.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: "Seul le technicien responsable peut soumettre un rapport d'analyse" 
      });
    }

    // Vérifier que l'échantillon est bien en statut "In Analysis"
    if (sample.status !== "In Analysis") {
      return res.status(400).json({ 
        error: "Le rapport ne peut être soumis que pour les échantillons en cours d'analyse" 
      });
    }

    // Mettre à jour le rapport d'analyse et le statut
    sample.analysisReport = analysisReport;
    sample.status = "Analyzed";
    sample.updatedAt = Date.now();
    
    await sample.save();

    // Créer des notifications
    // Notification pour le technicien
    await createNotification(
      req.user._id,
      `Rapport d'analyse soumis pour l'échantillon: ${sample.name}`,
      sample._id,
      sample.project
    );

    // Obtenir le projet pour notifier l'équipe
    const project = await Project.findById(sample.project);
    if (project) {
      const usersToNotify = [
        project.teamLead,
        ...project.teamMembers,
        project.createdBy
      ]
        .filter((userId) => userId && userId.toString() !== req.user._id.toString())
        .filter(Boolean);

      if (usersToNotify.length > 0) {
        await createNotificationForUsers(
          usersToNotify,
          `Rapport d'analyse disponible pour l'échantillon: ${sample.name}`,
          sample._id,
          sample.project,
          "Info",
          "Nouveau rapport d'analyse"
        );
      }
    }

    res.status(200).json({
      message: "Rapport d'analyse soumis avec succès",
      sample
    });

  } catch (error) {
    console.error("Erreur lors de la soumission du rapport d'analyse:", error);
    res.status(500).json({ error: error.message });
  }
};

// Vous pouvez également ajouter une fonction pour récupérer le rapport
exports.getAnalysisReport = async (req, res) => {
  try {
    const { sampleId } = req.params;
    
    const sample = await Sample.findById(sampleId)
      .populate("technicianResponsible", "name email institution")
      .select("name analysisReport status updatedAt");
      
    if (!sample) {
      return res.status(404).json({ error: "Échantillon non trouvé" });
    }
    
    res.status(200).json({
      sample
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération du rapport:", error);
    res.status(500).json({ error: error.message });
  }
};