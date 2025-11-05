import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pinSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    objectType: { type: String, required: true },
    objectId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    image: { type: String },
    position: { type: Number },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "pin",
    indexes: [
      { fields: { userId: 1, organizationId: 1, objectId: 1, objectType: 1 }, options: { unique: true } },
      { fields: { userId: 1, organizationId: 1 } },
      { fields: { organizationId: 1 } },
      { fields: { userId: 1, organizationId: 1, objectType: 1 } },
      { fields: { objectId: 1, objectType: 1 } }
    ]
  }
);

const Pin = model("Pin", pinSchema);

export { Pin };
