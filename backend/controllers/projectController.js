const Project = require("../models/Project");
const Sample = require("../models/Sample");

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
