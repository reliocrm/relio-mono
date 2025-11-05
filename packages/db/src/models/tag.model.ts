import mongoose from "mongoose";
import { TagRoleEnum } from "../lib/types";

const { Schema, model } = mongoose;

const tagSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    color: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    objectType: { type: String, required: true },
    objectTags: [{ type: Schema.Types.ObjectId, ref: "ObjectTag" }],
    permissions: [{ type: Schema.Types.ObjectId, ref: "TagPermission" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "tag",
    indexes: [
      // @@unique([name, organizationId, objectType])
      {
        fields: { name: 1, organizationId: 1, objectType: 1 },
        options: { unique: true }
      },
      // @@index([organizationId])
      { fields: { organizationId: 1 } },
      // @@index([organizationId, objectType])
      { fields: { organizationId: 1, objectType: 1 } }
    ]
  }
);

const tagPermissionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: TagRoleEnum, required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "tag_permission",
    indexes: [
      {
        fields: { tagId: 1, userId: 1 },
        options: { unique: true }
      },
      { fields: { userId: 1 } }
    ]
  }
);

const Tag = model("Tag", tagSchema);
const TagPermission = model("TagPermission", tagPermissionSchema);

export { Tag, TagPermission };
