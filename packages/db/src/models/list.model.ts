import mongoose from "mongoose";
import { ListRoleEnum } from "../lib/types";

const { Schema, model } = mongoose;

const listSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    description: { type: String },
    objectType: { type: String, required: true },
    filters: { type: Schema.Types.Mixed },
    isStatic: { type: Boolean, default: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "list",
    indexes: [
      { fields: { organizationId: 1, objectType: 1 } },
    ]
  }
);

const listPermissionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ListRoleEnum, required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "list_permission",
    indexes: [
      { fields: { listId: 1, userId: 1 }, options: { unique: true } },
      { fields: { userId: 1 } }
    ]
  }
);

const listItemSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    listId: { type: Schema.Types.ObjectId, ref: "List", required: true },
    objectId: { type: Schema.Types.ObjectId, required: true },
    objectType: { type: String, required: true },
    position: { type: Number },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    collection: "list_item",
    indexes: [
      { fields: { listId: 1, objectId: 1, objectType: 1 }, options: { unique: true } },
      { fields: { objectId: 1, objectType: 1 } },
      { fields: { listId: 1, position: 1 } },
    ]
  }
);

const List = model("List", listSchema);
const ListPermission = model("ListPermission", listPermissionSchema);
const ListItem = model("ListItem", listItemSchema);

export { List, ListPermission, ListItem };

