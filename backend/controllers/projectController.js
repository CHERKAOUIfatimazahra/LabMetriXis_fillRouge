const Project = require("../models/Project");
const Sample = require("../models/Sample");
const User = require("../models/User");

// Project Management Controllers
exports.createProject = async (req, res) => {
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

    // Validate required fields
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

    // Create project
    const project = new Project({
      projectName,
      researchDomain: researchDomains,
      teamLead,
      teamMembers: teamMembers.map((member) => ({
        user: member.id,
        role: member.role,
      })),
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
      project,
      projectId: project._id,
    });
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

exports.addSampleToProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    let sampleData = req.body;
    if (req.body.sampleData) {
      sampleData = JSON.parse(req.body.sampleData);
    }

    // Create new sample with project reference
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

    // Add sample to project
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
    // console.log("User ID:", req.user.id);

    // Récupérer les projets de l'utilisateur
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { teamLead: req.user.id },
        { "teamMembers.user": req.user.id },
      ],
    })
      .populate("samples")
      .populate("teamLead", "name email")
      .lean();

    // console.log("Projects found:", projects.length);

    // Calcul de la progression des projets
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
      .populate("teamLead", "name email")
      .populate("teamMembers.user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    // Calcul de la progression des projets
    const totalSamples = project.samples ? project.samples.length : 0;
    const analyzedSamples = project.samples
      ? project.samples.filter((sample) => sample.status === "Analyzed").length
      : 0;

    const progress =
      totalSamples === 0
        ? 0
        : Math.round((analyzedSamples / totalSamples) * 100);

    res.json({
      project,
      progress,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
};

// delete sample
exports.deleteSample = async (req, res) => {
  try {
    const id = req.params.sampleId;
    const sample = await Sample.findByIdAndDelete(id);
    if (!sample) {
      return res.status(404).json({ error: "Sample not found" });
    }
    const project = await Project.findById(sample.projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
// Update project samples count
    project.samples = project.samples.filter((s) => s._id.toString() !== id);
    await project.save();
    res.json({ message: "Sample deleted successfully" });
  } catch (error) {
    console.error("Error deleting sample:", error);
    res.status(500).json({ error: "Failed to delete sample" });
  }
};

// delete project by role createBy

exports.deleteProjectByRole = async (req, res) => {
  try {
    const id = req.params.projectId;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Vérifier si l'utilisateur est le créateur du projet
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Supprimer le projet
    await Project.findByIdAndDelete(id);

    // Mettre à jour le compte des projets de l'utilisateur
    const user = await User.findById(req.user._id);
    user.projects = user.projects.filter((p) => p._id.toString() !== id);
    await user.save();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};
