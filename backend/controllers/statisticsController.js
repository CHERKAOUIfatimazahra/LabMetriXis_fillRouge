const Project = require("../models/Project");

// manager les statistic pour afficher dans dashboard project
const getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({ createdBy: userId });

    // Calculate total projects
    const totalProjects = projects.length;

    // Calculate status distribution
    const statusDistribution = {
      Planning: projects.filter((p) => p.status === "Planning").length,
      Active: projects.filter((p) => p.status === "Active").length,
      Completed: projects.filter((p) => p.status === "Completed").length,
      OnHold: projects.filter((p) => p.status === "On Hold").length,
      Cancelled: projects.filter((p) => p.status === "Cancelled").length,
    };

    // Calculate total budget
    const totalBudget = projects.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );

    // Calculate total samples
    const sampleCount = projects.reduce(
      (sum, project) => sum + (project.samples ? project.samples.length : 0),
      0
    );

    res.status(200).json({
      totalProjects,
      statusDistribution,
      budgetStatistics: { totalBudget },
      sampleStatistics: { totalSamples: sampleCount },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStatistics };
