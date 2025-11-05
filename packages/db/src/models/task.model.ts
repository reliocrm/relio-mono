import mongoose from "mongoose";
import { TaskStatusEnum, TaskPriorityEnum } from "../lib/types";

const { Schema, model } = mongoose;

const taskSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    title: { type: String, required: true },
    description: { type: String },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: TaskStatusEnum,
      default: "todo"
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    // Related Object
    relatedObjectId: { type: Schema.Types.ObjectId },
    relatedObjectType: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    priority: {
      type: String,
      enum: TaskPriorityEnum,
      default: "no_priority"
    },
    position: { type: Number },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "task",
    indexes: [
      { fields: { organizationId: 1 }, options: { name: "by_organization" } },
      { fields: { assigneeId: 1 }, options: { name: "by_assignee" } },
      { fields: { status: 1 }, options: { name: "by_status" } },
      { fields: { dueDate: 1 }, options: { name: "by_due_date" } },
      { fields: { position: 1 }, options: { name: "by_position" } },
      { fields: { status: 1, position: 1 }, options: { name: "by_status_position" } },
      { fields: { relatedObjectId: 1, relatedObjectType: 1 }, options: { name: "by_related_object" } },
      { fields: { organizationId: 1, relatedObjectType: 1 }, options: { name: "by_org_object_type" } }
    ]
  }
);

const columnPreferenceSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    column: { type: String, required: true },
    trackTimeInStatus: { type: Boolean, required: true },
    showConfetti: { type: Boolean, required: true },
    hidden: { type: Boolean, required: true },
    targetTimeInStatus: { type: Number },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "column_preference",
    indexes: [
      { fields: { organizationId: 1, column: 1 }, options: { name: "by_organization_column" } }
    ]
  }
);

const ColumnPreference = model("ColumnPreference", columnPreferenceSchema);
const Task = model("Task", taskSchema);

export { Task, ColumnPreference };
