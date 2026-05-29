import { DocumentModel } from "../models/documentModel.js";

export const createDocument = async (userId) => {
  const doc = await DocumentModel.create({
    owner: userId,
    title: "Untitled Document",
    content: { type: "doc", content: [] },
    versions: [],
  });

  return doc;
};


