const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportVersionSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["auto", "manual", "upload"], default: "manual" },
});

const finalReportSchema = new mongoose.Schema({
  content: String,
  publishedAt: Date,
  lastModified: { type: Date, default: Date.now },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const projectSchema = new Schema({
  projectName: { type: String, required: true },
  researchDomain: { type: String, required: true },
  teamLead: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teamMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  fundingSource: { type: String },
  budget: { type: Number },
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Planning", "Active", "Completed", "On Hold", "Cancelled"],
    default: "Planning",
  },
  collaboratingInstitutions: { type: String },
  description: { type: String, required: true },
  expectedOutcomes: { type: String },
  samples: [
    {
      type: Schema.Types.ObjectId,
      ref: "Sample",
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  finalReport: finalReportSchema,
  reportVersions: [reportVersionSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
