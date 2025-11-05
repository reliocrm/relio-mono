import mongoose from "mongoose";
const { Schema, model } = mongoose;

const noteSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    parentDocument: { type: Schema.Types.ObjectId, ref: "Note", default: null },
    content: { type: String },
    coverImage: { type: String },
    icon: { type: String },
    objectId: { type: Schema.Types.ObjectId },
    objectType: { type: String },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false }
  },
  {
    collection: "note",
    indexes: [
      { fields: { userId: 1 }, options: {} },
      { fields: { orgId: 1 }, options: {} },
      { fields: { userId: 1, parentDocument: 1 }, options: {} }
    ]
  }
);

const Note = model("Note", noteSchema);

export { Note };

