
const isChercheur = (req, res, next) => {
  if (req.user && req.user.role === "chercheur") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Chercheur role required." });
  }
};

const isTechnician = (req, res, next) => {
  if (req.user && req.user.role === "technicien") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Technicien role required." });
  }
};

module.exports = {
  isChercheur,
  isTechnician
};