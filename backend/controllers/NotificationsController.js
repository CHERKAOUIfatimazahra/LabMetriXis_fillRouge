const Notification = require("../models/Notification");

// Get all notifications for the current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("relatedProject", "name")
      .populate("relatedSample", "name");

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
};

// Get count of unread notifications
exports.getUnreadCount = async (req, res) => {
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
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
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
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
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
};

// Create a new notification dynamically
exports.createNotification = async (
  userId,
  message,
  relatedProject = null,
  relatedSample = null,
  type = "Action",
  title = "Nouvelle activité"
) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedProject,
      relatedSample,
      isRead: false,
      createdAt: new Date(),
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error(
      "Erreur lors de la création de la notification :",
      err.message
    );
    return null;
  }
};

// Ajoutez une nouvelle fonction pour envoyer à plusieurs utilisateurs
exports.createNotificationForUsers = async (
  userIds,
  message,
  relatedProject = null,
  relatedSample = null,
  type = "Action",
  title = "Nouvelle activité"
) => {
  try {
    if (!Array.isArray(userIds)) {
      userIds = [userIds]; // Convertir en tableau si un seul ID est passé
    }

    const notifications = [];
    const notificationPromises = userIds.map((userId) => {
      return this.createNotification(
        userId,
        message,
        relatedProject,
        relatedSample,
        type,
        title
      );
    });

    const results = await Promise.all(notificationPromises);
    return results.filter((result) => result !== null);
  } catch (err) {
    console.error(
      "Erreur lors de la création des notifications multiples :",
      err.message
    );
    return [];
  }
};