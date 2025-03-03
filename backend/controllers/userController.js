const User = require("../models/User");

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



