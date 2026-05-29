import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { CommentModel } from "../models/commentModel.js";
import { DocumentModel } from "../models/documentModel.js";

export const commentRoute = express.Router();

// Add a comment to a document
commentRoute.post("/add", verifyToken, async (req, res) => {
  try {
    const { documentId, text } = req.body;
    const userId = req.user.userId;

    if (!documentId || !text) {
      return res.status(400).json({
        success: false,
        message: "Document ID and comment text are required",
      });
    }

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Verify user authorization on the document
    const isOwner = (document.owner._id || document.owner).toString() === userId;
    const isCollaborator = document.collaborators.some(
      (c) => (c.user?._id || c.user).toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const username = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() || "Anonymous";

    const comment = new CommentModel({
      documentId,
      userId,
      username,
      text,
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Retrieve comments for a document
commentRoute.get("/:documentId", verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Verify user authorization on the document
    const isOwner = (document.owner._id || document.owner).toString() === userId;
    const isCollaborator = document.collaborators.some(
      (c) => (c.user?._id || c.user).toString() === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const comments = await CommentModel.find({ documentId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
