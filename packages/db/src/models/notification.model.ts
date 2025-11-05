import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
  },
  {
    collection: "notification",
    indexes: [
      { fields: { userId: 1 } },
      { fields: { userId: 1, read: 1 } },
      { fields: { userId: 1, createdAt: 1 } },
      { fields: { createdAt: 1 } }
    ]
  }
);

const notificationSettingsSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    emailMentions: { type: Boolean, default: true },
    emailComments: { type: Boolean, default: false },
    emailActivities: { type: Boolean, default: false },
    pushMentions: { type: Boolean, default: true },
    pushComments: { type: Boolean, default: false },
    pushActivities: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "notification_settings"
  }
);

const Notification = model("Notification", notificationSchema);
const NotificationSettings = model("NotificationSettings", notificationSettingsSchema);

export { Notification, NotificationSettings };

