import mongoose from "mongoose";

const { Schema, model } = mongoose;

const waitlistSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    email: { type: String, required: true, index: true, unique: true },
    source: { type: String },
    subscribed: { type: Boolean, default: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    collection: "waitlist",
  },
);

const Waitlist = model("Waitlist", waitlistSchema);

export { Waitlist };


