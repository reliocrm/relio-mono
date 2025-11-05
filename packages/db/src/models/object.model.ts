import mongoose from "mongoose";
import { ObjectViewTypeEnum } from "../lib/types";

const { Schema, model } = mongoose;


const customFieldDefinitionSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String },
    type: { type: String, required: true },
    objectType: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    isRequired: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: false },
    options: { type: Schema.Types.Mixed },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "custom_field_definition",
    indexes: [
      { fields: { organizationId: 1, objectType: 1, name: 1 }, options: { unique: true } },
      { fields: { organizationId: 1, objectType: 1 } }
    ]
  }
);

const customObjectSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    objectType: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    description: { type: String },
    status: { type: String },
    tags: [{ type: String }],
    customFields: { type: Schema.Types.Mixed },
    lastViewedAt: { type: Date },
    lastViewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "custom_object",
    indexes: [
      { fields: { organizationId: 1, objectType: 1 } },
      { fields: { organizationId: 1, objectType: 1, isDeleted: 1 } },
      { fields: { organizationId: 1, objectType: 1, createdBy: 1 } },
      { fields: { organizationId: 1, objectType: 1, status: 1 } }
    ]
  }
);

const objectViewSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    objectType: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    columnDefs: { type: Schema.Types.Mixed, required: true },
    cardRowFields: { type: Schema.Types.Mixed },
    showAttributeLabels: { type: Boolean, default: true },
    filters: { type: Schema.Types.Mixed },
    filterCondition: { type: String },
    viewType: { type: String, enum: ObjectViewTypeEnum, default: ObjectViewTypeEnum.TABLE },
    statusAttribute: { type: String },
    kanbanConfig: { type: Schema.Types.Mixed },
    sortBy: { type: String },
    sortDirection: { type: String },
    mapConfig: { type: Schema.Types.Mixed },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    userPreferences: [{ type: Schema.Types.ObjectId, ref: "UserViewPreference" }],
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "object_view",
    indexes: [
      { fields: { organizationId: 1 } },
      { fields: { organizationId: 1, objectType: 1 } },
      { fields: { organizationId: 1, createdBy: 1 } }
    ]
  }
);

const objectTagSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
    tag: { type: Schema.Types.Mixed },
    objectId: { type: Schema.Types.ObjectId, required: true },
    objectType: { type: String, required: true },
    contact: { type: Schema.Types.Mixed },
    company: { type: Schema.Types.Mixed },
    property: { type: Schema.Types.Mixed },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    adder: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: () => new Date() }
  },
  {
    collection: "object_tag",
    indexes: [
      { fields: { tagId: 1, objectId: 1, objectType: 1 }, options: { unique: true } },
      { fields: { objectId: 1, objectType: 1 } },
      { fields: { tagId: 1 } }
    ]
  }
);

const objectStatusHistorySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    objectId: { type: Schema.Types.ObjectId, required: true },
    objectType: { type: String, required: true },
    statusField: { type: String, required: true },
    fromStatus: { type: String },
    toStatus: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "object_status_history",
    indexes: [
      { fields: { objectId: 1, objectType: 1 } },
      { fields: { organizationId: 1 } },
      { fields: { objectId: 1, objectType: 1, statusField: 1 } }
    ]
  }
);

const objectRelationshipSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    object1Id: { type: Schema.Types.ObjectId, required: true },
    object1Type: { type: String, required: true },
    object1Role: { type: String, required: true },
    object2Id: { type: Schema.Types.ObjectId, required: true },
    object2Type: { type: String, required: true },
    object2Role: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "object_relationship",
    indexes: [
      { fields: { object1Id: 1, object1Type: 1 } },
      { fields: { object2Id: 1, object2Type: 1 } },
      { fields: { organizationId: 1 } },
      { fields: { organizationId: 1, object1Type: 1, object2Type: 1 } },
      { fields: { organizationId: 1, object1Type: 1 } },
      { fields: { organizationId: 1, object2Type: 1 } },
      { fields: { organizationId: 1, isActive: 1 } },
      { fields: { object1Id: 1, object1Type: 1, object2Id: 1, object2Type: 1, organizationId: 1 }, options: { unique: true } }
    ]
  }
);

const userViewPreferenceSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    objectType: { type: String, required: true }, // 'contact', 'company', 'property', etc.
    viewId: { type: Schema.Types.ObjectId, ref: "ObjectView", required: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "user_view_preference",
    indexes: [
      { fields: { userId: 1 } },
      { fields: { organizationId: 1 } },
      { fields: { userId: 1, organizationId: 1 } },
      { fields: { viewId: 1 } },
      { fields: { userId: 1, organizationId: 1, objectType: 1 }, options: { unique: true } }
    ]
  }
);

const ObjectRelationship = model("ObjectRelationship", objectRelationshipSchema);
const ObjectStatusHistory = model("ObjectStatusHistory", objectStatusHistorySchema);
const ObjectTag = model("ObjectTag", objectTagSchema);
const ObjectView = model("ObjectView", objectViewSchema);
const CustomObject = model("CustomObject", customObjectSchema);
const CustomFieldDefinition = model("CustomFieldDefinition", customFieldDefinitionSchema);
const UserViewPreference = model("UserViewPreference", userViewPreferenceSchema);

export { ObjectTag, ObjectView, CustomObject, CustomFieldDefinition, ObjectStatusHistory, ObjectRelationship, UserViewPreference };
