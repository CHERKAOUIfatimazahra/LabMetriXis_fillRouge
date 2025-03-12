const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");

// Project Management Controllers
exports.createProject = async (req, res) => {
  // cheque if the project orady exists
  const project = await Project.findOne({ projectName: req.body.name });
  if (project) {
    return res.status(400).json({ message: "Project already exists" });
  }
  // create a new project
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

    // if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    //   return res.status(400).json({
    //     error: "Invalid or missing project ID",
    //     receivedId: projectId,
    //   });
    // }

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
