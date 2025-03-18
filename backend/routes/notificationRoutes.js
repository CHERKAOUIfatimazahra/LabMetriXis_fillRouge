const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

// Get all notifications for the current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("relatedProject", "name")
      .populate("relatedSample", "name");

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Get count of unread notifications
router.get("/count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Mark a notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification non trouvée" });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Mark all notifications as read
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ msg: "Toutes les notifications ont été marquées comme lues" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Create a new notification
router.post("/create", async (req, res) => {
  try {
    const { userId, title, message, type, relatedProject, relatedSample } =
      req.body;

    const notification = new Notification({
      user: userId,
      title,
      message,
      type: type || "Info",
      relatedProject,
      relatedSample,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
