const User = require("../models/User");
const Project = require("../models/Project");

exports.getAvailableTeamMembers = async (req, res) => {
  try {
    const chercheur = await User.find({ role: "chercheur" });
    res.json(chercheur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: "technicien" });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete member from project by the team lead
exports.deleteMemberFromProject = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId).populate(
      "teamMembers",
      "name email institution"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLead._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only team leader can remove members" });
    }

    const memberIndex = project.teamMembers.findIndex(
      (member) => member.user?._id.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: "Team member not found" });
    }

    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate("samples")
      .populate("teamLead", "name email institution")
      .populate("teamMembers", "name email institution")
      .lean()
      .exec();

    res.json({
      message: "Team member removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
