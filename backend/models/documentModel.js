import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Document",
    },

    content: {
      type: Object,
      default: { type: "doc", content: [] },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["viewer", "editor"],
          default: "viewer",
        },
      },
    ],
    versions: [
      {
        title: { type: String },
        content: { type: Object },
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        editedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model("Document", documentSchema);