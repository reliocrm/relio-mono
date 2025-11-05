import mongoose from "mongoose";

const { Schema, model } = mongoose;

const feedbackSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "feedback",
  }
);

const Feedback = model("Feedback", feedbackSchema);

export { Feedback };

