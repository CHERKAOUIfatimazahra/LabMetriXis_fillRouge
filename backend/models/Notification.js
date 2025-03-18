const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Info", "Warning", "Action", "Success"],
    default: "Info",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedProject: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    default: null,
  },
  relatedSample: {
    type: Schema.Types.ObjectId,
    ref: "Sample",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
