const Project = require("../models/Project");
const Sample = require("../models/Sample");
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
      .populate("project", "projectName teamLead teamMembers");
    res.json(samples);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// function to update project status
const updateProjectStatus = async (projectId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project || project.status === "Active") {
      return;
    }

    project.status = "Active";
    project.updatedAt = Date.now();
    await project.save();

    return project;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};

// update the status of a sample
exports.updateSampleStatus = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { status } = req.body;

    const validStatuses = ["In Analysis", "Analyzed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const sample = await Sample.findById(sampleId).populate("project");

    if (!sample) {
      return res.status(404).json({ message: "Sample not found" });
    }

    if (sample.status === status) {
      return res.status(400).json({ message: "Sample already in this status" });
    }

    sample.status = status;
    await sample.save();

    if (status === "In Analysis") {
      await updateProjectStatus(sample.project._id);
    }

    // Create notification
    const notificationMessage =
      status === "In Analysis"
        ? "L'analyse de l'échantillon a commencé"
        : "L'analyse de l'échantillon est terminée";

    await createNotification(
      req.user._id,
      notificationMessage,
      sample._id,
      sample.project._id
    );

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
        sample.project._id,
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

// creation pour un rapport d'analyse
exports.submitAnalysisReport = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { analysisReport } = req.body;

    if (!sampleId) {
      return res.status(400).json({ error: "ID d'échantillon invalide" });
    }

    const sample = await Sample.findById(sampleId).populate("project");
    if (!sample) {
      return res.status(404).json({ error: "Échantillon non trouvé" });
    }

    // if (sample.technicianResponsible.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     error:
    //       "Seul le technicien responsable peut soumettre un rapport d'analyse",
    //   });
    // }

    if (sample.status !== "In Analysis") {
      return res.status(400).json({
        error:
          "Le rapport ne peut être soumis que pour les échantillons en cours d'analyse",
      });
    }

    sample.analysisReport = analysisReport;
    sample.status = "Analyzed";
    sample.updatedAt = Date.now();

    await sample.save();

    if (sample.project) {
      await updateProjectStatus(sample.project._id);
    }

    // Créer des notifications
    await createNotification(
      req.user._id,
      `Rapport d'analyse soumis pour l'échantillon: ${sample.name}`,
      sample._id,
      sample.project._id
    );

    const project = await Project.findById(sample.project);
    if (project) {
      const usersToNotify = [
        project.teamLead,
        ...project.teamMembers,
        project.createdBy,
      ]
        .filter(
          (userId) => userId && userId.toString() !== req.user._id.toString()
        )
        .filter(Boolean);

      if (usersToNotify.length > 0) {
        await createNotificationForUsers(
          usersToNotify,
          `Rapport d'analyse disponible pour l'échantillon: ${sample.name}`,
          sample._id,
          sample.project._id,
          "Info",
          "Nouveau rapport d'analyse"
        );
      }
    }

    res.status(200).json({
      message: "Rapport d'analyse soumis avec succès",
      sample,
    });
  } catch (error) {
    console.error("Erreur lors de la soumission du rapport d'analyse:", error);
    res.status(500).json({ error: error.message });
  }
};

// get analysis report
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
      sample,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rapport:", error);
    res.status(500).json({ error: error.message });
  }
};
