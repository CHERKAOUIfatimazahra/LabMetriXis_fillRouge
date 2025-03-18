const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const {
  createNotification,
  createNotificationForUsers,
} = require("../controllers/NotificationsController");

// creation de projet
exports.createProject = async (req, res) => {
  try {
    const projectExists = await Project.findOne({
      projectName: req.body.projectName,
    });
    if (projectExists) {
      return res.status(400).json({ message: "Project already exists" });
    }

    const {
      projectName,
      researchDomains,
      teamLead,
      fundingSource,
      budget,
      startDate,
      deadline,
      status,
      collaboratingInstitutions,
      description,
      expectedOutcomes,
      teamMembers,
    } = req.body;

    if (
      !projectName ||
      !researchDomains ||
      !teamLead ||
      !startDate ||
      !deadline ||
      !description
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = new Project({
      projectName,
      researchDomain: researchDomains,
      teamLead,
      teamMembers,
      fundingSource,
      budget,
      startDate,
      deadline,
      status,
      collaboratingInstitutions,
      description,
      expectedOutcomes,
      createdBy: req.user._id,
    });

    await project.save();

    // Création de notification
    await createNotification(
      req.user._id,
      `Nouveau projet créé: ${projectName}`,
      project._id,
      null
    );

    // Notification pour le teamLead et les membres
    const usersToNotify = [teamLead, ...teamMembers].filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );

    if (usersToNotify.length > 0) {
      await createNotificationForUsers(
        usersToNotify,
        `Vous avez été ajouté au projet: ${projectName}`,
        project._id,
        null,
        "Info",
        "Nouveau projet"
      );
    }

    res.status(201).json({
      message: "Project created successfully",
      projectId: project._id,
      project,
    });
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Ajouter un échantillon au projet
exports.addSampleToProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Invalid or missing project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    let sampleData = req.body;
    if (req.body.sampleData) {
      sampleData = JSON.parse(req.body.sampleData);
    }

    const sample = new Sample({
      name: sampleData.name,
      description: sampleData.description,
      type: sampleData.type,
      quantity: sampleData.quantity,
      unit: sampleData.unit,
      collectionDate: sampleData.collectionDate,
      technicianResponsible: sampleData.technicianResponsible,
      storageConditions: sampleData.storageConditions || "",
      expirationDate: sampleData.expirationDate,
      status: sampleData.status || "Pending",
      identification: sampleData.identification,
      project: projectId,
      createdBy: req.user._id,
    });

    if (req.file) {
      sample.protocolFile = {
        fileName: req.file.originalname,
        fileLocation: req.file.path,
        fileType: req.file.mimetype,
      };
    }

    await sample.save();

    // Création de notification
    await createNotification(
      req.user._id,
      `Nouvel échantillon ajouté: ${sample.name}`,
      projectId,
      sample._id
    );

    // Notifications pour l'équipe du projet
    const teamUsers = [project.teamLead, ...project.teamMembers].filter(
      (userId) => userId && userId.toString() !== req.user._id.toString()
    );

    // Notification spéciale pour le technicien responsable
    if (
      sample.technicianResponsible &&
      sample.technicianResponsible.toString() !== req.user._id.toString() &&
      !teamUsers.includes(sample.technicianResponsible.toString())
    ) {
      teamUsers.push(sample.technicianResponsible);
    }

    if (teamUsers.length > 0) {
      await createNotificationForUsers(
        teamUsers,
        `Nouvel échantillon ajouté au projet: ${sample.name}`,
        projectId,
        sample._id,
        "Info",
        "Nouvel échantillon"
      );
    }

    await Project.findByIdAndUpdate(projectId, {
      $push: { samples: sample._id },
    });

    res.status(201).json({
      message: "Sample added successfully",
      sample,
    });
  } catch (error) {
    console.error("Error adding sample:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir tous les échantillons d'un projet
exports.getSamplesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const samples = await Sample.find({ project: projectId }).sort({
      createdAt: -1,
    });
    res.json(samples);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir tous les projets
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { teamLead: req.user.id },
        { "teamMembers.user": req.user.id },
      ],
    })
      .populate("samples")
      .populate("teamLead", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const projectsWithProgress = projects.map((project) => {
      const totalSamples = project.samples ? project.samples.length : 0;
      const analyzedSamples = project.samples
        ? project.samples.filter((sample) => sample.status === "Analyzed")
            .length
        : 0;

      const progress =
        totalSamples === 0
          ? 0
          : Math.round((analyzedSamples / totalSamples) * 100);

      return {
        ...project,
        progress,
      };
    });

    res.json(projectsWithProgress);
  } catch (error) {
    console.error("Erreur détaillée:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des projets" });
  }
};

// Obtenir un projet par ID
exports.getProjectById = async (req, res) => {
  try {
    const id = req.params.projectId;
    const project = await Project.findById(id)
      .populate("samples")
      .populate("teamLead", "name email institution")
      .populate("teamMembers", "name email institution")
      .lean()
      .exec();

    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    const totalSamples = project.samples ? project.samples.length : 0;
    const analyzedSamples = project.samples
      ? project.samples.filter((sample) => sample.status === "Analyzed").length
      : 0;

    const progress =
      totalSamples === 0
        ? 0
        : Math.round((analyzedSamples / totalSamples) * 100);

    res.json({
      project: {
        ...project,
        progress,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
};

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
  try {
    const {
      projectName,
      researchDomains,
      teamLead,
      fundingSource,
      budget,
      startDate,
      deadline,
      status,
      collaboratingInstitutions,
      description,
      expectedOutcomes,
      teamMembers,
    } = req.body;

    if (
      !projectName ||
      !researchDomains ||
      !teamLead ||
      !startDate ||
      !deadline ||
      !description
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.projectName = projectName;
    project.researchDomain = researchDomains;
    project.teamLead = teamLead;
    project.teamMembers = teamMembers;
    project.fundingSource = fundingSource;
    project.budget = budget;
    project.startDate = startDate;
    project.deadline = deadline;
    project.status = status;
    project.collaboratingInstitutions = collaboratingInstitutions;
    project.description = description;
    project.expectedOutcomes = expectedOutcomes;

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Project update error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// Supprimer l'échantillion
exports.deleteSample = async (req, res) => {
  try {
    const { projectId, sampleId } = req.params;

    if (!projectId || !sampleId) {
      return res.status(400).json({ error: "Invalid project or sample ID" });
    }
    const sample = await Sample.findByIdAndDelete(sampleId);
    if (!sample) {
      return res.status(404).json({ error: "Sample not found" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    project.samples = project.samples.filter(
      (s) => s._id.toString() !== sampleId
    );
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("samples")
      .populate("teamLead", "name email institution")
      .populate("teamMembers", "name email institution")
      .lean()
      .exec();

    res.json({
      message: "Sample deleted successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error deleting sample:", error);
    res.status(500).json({ error: "Failed to delete sample" });
  }
};

// Supprimer le projet en tant que responsable du project
exports.deleteProjectByRole = async (req, res) => {
  try {
    const id = req.params.projectId;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await Project.findByIdAndDelete(id);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// Sauvegarde le brouillon du rapport final
exports.saveFinalReportDraft = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, publishedAt } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.reportVersions) {
      project.reportVersions = [];
    }

    // Ajoute une nouvelle version du rapport
    project.reportVersions.push({
      content,
      createdAt: new Date(),
      createdBy: req.user._id,
    });

    // Met à jour le rapport final
    project.finalReport = {
      content,
      publishedAt,
      lastModified: new Date(),
      status: "draft",
    };

    if (project.status !== "Active") {
      project.status = "Active";
    }

    await project.save();

    res.status(200).json({
      message: "Draft saved successfully",
      finalReport: project.finalReport,
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ message: "Failed to save draft" });
  }
};

// Publie le rapport final
exports.publishFinalReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, publishedAt } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Met à jour le rapport final
    project.finalReport = {
      content,
      publishedAt,
      lastModified: new Date(),
      status: "published",
      publishedBy: req.user._id,
    };

    if (project.status !== "Completed") {
      project.status = "Completed";
    }

    await project.save();

    res.status(200).json({
      message: "Final report published successfully",
      finalReport: project.finalReport,
    });
  } catch (error) {
    console.error("Error publishing report:", error);
    res.status(500).json({ message: "Failed to publish report" });
  }
};

// Récupère toutes les versions du rapport
exports.getReportVersions = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const versions = project.reportVersions || [];
    res.status(200).json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    res.status(500).json({ message: "Failed to fetch versions" });
  }
};

// Récupère une version spécifique du rapport
exports.getReportVersion = async (req, res) => {
  try {
    const { projectId, versionId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const version = project.reportVersions.id(versionId);
    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }

    res.status(200).json(version);
  } catch (error) {
    console.error("Error fetching version:", error);
    res.status(500).json({ message: "Failed to fetch version" });
  }
};

// Upload report file
exports.uploadReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.reportVersions) {
      project.reportVersions = [];
    }

    project.reportVersions.push({
      content,
      createdAt: new Date(),
      createdBy: req.user._id,
      type: "upload",
    });

    project.finalReport = {
      content,
      lastModified: new Date(),
      status: "draft",
    };

    if (project.status !== "Active") {
      project.status = "Active";
    }

    await project.save();

    res.status(200).json({
      message: "Report uploaded successfully",
      finalReport: project.finalReport,
    });
  } catch (error) {
    console.error("Error uploading report:", error);
    res.status(500).json({ message: "Failed to upload report" });
  }
};

// get sample by id
exports.getSampleById = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ message: "Sample not found" });
    }
    res.status(200).json(sample);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update sample
exports.updateSample = async (req, res) => {
  try {
    const { sampleId } = req.params;

    if (!sampleId) {
      return res.status(400).json({ error: "Invalid sample ID" });
    }

    const sample = await Sample.findById(sampleId)
      .populate("technicianResponsible", "name email institution")
      .exec();

    if (!sample) {
      return res.status(404).json({ error: "Sample not found" });
    }

    let updatedData = req.body;
    if (req.body.sampleData) {
      updatedData = JSON.parse(req.body.sampleData);
    }

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        sample[key] = updatedData[key];
      }
    });

    if (req.file) {
      if (sample.protocolFile) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads",
          sample.protocolFile.fileLocation
        );
      }

      const newFileName = `${Date.now()}-${req.file.originalname}`;

      sample.protocolFile = {
        fileName: newFileName,
        fileLocation: path.join("uploads", newFileName),
        fileType: req.file.mimetype,
      };
    }

    await sample.save();

    res.status(200).json({
      message: "Sample updated successfully",
      sample,
    });
  } catch (error) {
    console.error("Error updating sample:", error);
    res.status(500).json({ error: error.message });
  }
};
