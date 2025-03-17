const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const {
  createNotification,
  createNotificationForUsers,
} = require("../controllers/NotificationsController");

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

    // Création de notification pour le créateur
    await createNotification(
      req.user._id,
      `Nouveau projet créé: ${projectName}`,
      project._id,
      null
    );

    // Notification pour le teamLead et les membres (s'ils sont différents du créateur)
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

exports.addSampleToProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Invalid or missing project ID" });
    }

    // Récupérer le projet
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

    // Création de notification pour l'utilisateur qui ajoute l'échantillon
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

    // Notification spéciale pour le technicien responsable s'il est différent de l'utilisateur actuel
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

    // Mettre à jour le projet
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

exports.deleteSample = async (req, res) => {
  try {
    const { projectId, sampleId } = req.params;

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

    const user = await User.findById(req.user._id);
    user.projects = user.projects.filter((p) => p._id.toString() !== id);
    await user.save();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// Save draft of final report
exports.saveFinalReportDraft = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, publishedAt } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Save the current version to version history
    if (!project.reportVersions) {
      project.reportVersions = [];
    }

    // Add current version to history
    project.reportVersions.push({
      content,
      createdAt: new Date(),
      createdBy: req.user._id,
    });

    // Update the draft
    project.finalReport = {
      content,
      publishedAt,
      lastModified: new Date(),
      status: "draft",
    };

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

// Publish final report
exports.publishFinalReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content, publishedAt } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update the final report
    project.finalReport = {
      content,
      publishedAt,
      lastModified: new Date(),
      status: "published",
      publishedBy: req.user._id,
    };

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

// Get report versions
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

// Get specific version
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

    // Vérifier si l'ID est valide
    if (!sampleId) {
      return res.status(400).json({ error: "Invalid sample ID" });
    }

    // Récupérer l'échantillon et peupler le champ technicianResponsible avec les informations du technicien
    const sample = await Sample.findById(sampleId)
      .populate("technicianResponsible", "name email institution")
      .exec();

    if (!sample) {
      return res.status(404).json({ error: "Sample not found" });
    }

    // Récupérer les nouvelles données
    let updatedData = req.body;
    if (req.body.sampleData) {
      updatedData = JSON.parse(req.body.sampleData);
    }

    // Mettre à jour les champs fournis
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined) {
        sample[key] = updatedData[key];
      }
    });

    // Gestion de l'upload du fichier (si un nouveau fichier est fourni)
    if (req.file) {
      // Si un fichier existait déjà, supprimer l'ancien fichier
      if (sample.protocolFile) {
        const oldFilePath = path.join(
          __dirname,
          "../uploads",
          sample.protocolFile.fileLocation
        );
      }

      // Générer un nouveau nom de fichier unique
      const newFileName = `${Date.now()}-${req.file.originalname}`;

      // Mettre à jour le fichier avec le nouveau
      sample.protocolFile = {
        fileName: newFileName, // Nouveau nom unique
        fileLocation: path.join("uploads", newFileName),
        fileType: req.file.mimetype,
      };
    }

    // Sauvegarder les modifications
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


