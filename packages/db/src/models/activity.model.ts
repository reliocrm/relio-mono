import mongoose from "mongoose";

const { Schema, model } = mongoose;

const activitySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recordId: { type: Schema.Types.ObjectId, refPath: "recordType" },
    recordType: { type: String },
    type: { type: String, required: true, default: "note" },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    phone: { type: String },
    result: { type: String },
    system: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    mentionedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    replies: [{ type: Schema.Types.ObjectId, ref: "ActivityReply" }],
    reactions: [{ type: Schema.Types.ObjectId, ref: "ActivityReaction" }],
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "activity",
    indexes: [
      { fields: { organizationId: 1 } },
      { fields: { organizationId: 1, recordId: 1 } },
      { fields: { organizationId: 1, recordType: 1 } },
      { fields: { organizationId: 1, userId: 1 } },
      { fields: { organizationId: 1, type: 1 } },
      { fields: { recordId: 1, recordType: 1 } },
      { fields: { userId: 1 } }
    ]
  }
);

const activityReplySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    activityId: { type: Schema.Types.ObjectId, ref: "Activity", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    mentionedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "activity_reply",
    indexes: [
      { fields: { activityId: 1 } },
      { fields: { userId: 1 } }
    ]
  }
);

const activityReactionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    activityId: { type: Schema.Types.ObjectId, ref: "Activity", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() }
  },
  {
    collection: "activity_reaction",
    indexes: [
      { fields: { activityId: 1, userId: 1, emoji: 1 }, options: { unique: true } },
      { fields: { activityId: 1 } },
      { fields: { userId: 1 } }
    ]
  }
);

const emailActivitySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sourceType: { type: String, required: true },
    sourceId: { type: Schema.Types.ObjectId },
    messageId: { type: String, required: true },
    threadId: { type: String },
    inReplyTo: { type: String },
    references: [{ type: String, default: [] }],
    from: { type: String, required: true },
    to: [{ type: String, default: [] }],
    cc: [{ type: String, default: [] }],
    bcc: [{ type: String, default: [] }],
    subject: { type: String, required: true },
    body: { type: String, required: true },
    bodyPlain: { type: String },
    attachments: { type: Schema.Types.Mixed },
    headers: { type: Schema.Types.Mixed },
    direction: { type: String, required: true },
    timestamp: { type: Date, required: true },
    isRead: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    processedAt: { type: Date },
    processingNotes: { type: String },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "email_activity",
    indexes: [
      { fields: { organizationId: 1, timestamp: 1 } },
      { fields: { organizationId: 1, userId: 1 } },
      { fields: { messageId: 1 } },
      { fields: { threadId: 1 } },
      { fields: { from: 1 } },
      { fields: { organizationId: 1, sourceType: 1 } },
      { fields: { organizationId: 1, direction: 1 } }
    ]
  }
);

const Activity = model("Activity", activitySchema);
const ActivityReply = model("ActivityReply", activityReplySchema);
const ActivityReaction = model("ActivityReaction", activityReactionSchema);
const EmailActivity = model("EmailActivity", emailActivitySchema);

export { Activity, ActivityReply, ActivityReaction, EmailActivity };
