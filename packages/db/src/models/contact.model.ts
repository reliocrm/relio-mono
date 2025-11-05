import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    apolloId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    image: { type: String },
    title: { type: String },
    persona: { type: String },
    status: { type: String },
    address: { type: Schema.Types.Mixed },
    phone: { type: Schema.Types.Mixed },
    email: { type: Schema.Types.Mixed },
    website: { type: String },
    social: { type: Schema.Types.Mixed },
    source: { type: String },
    stage: { type: String },
    birthday: { type: String },
    age: { type: Number },
    spouseName: { type: String },
    summary: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    buyerNeeds: { type: Schema.Types.Mixed },
    generatedSummary: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastViewedAt: { type: Date },
    lastViewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "contact",
    indexes: [
      { fields: { organizationId: 1 } },
      { fields: { organizationId: 1, firstName: 1, lastName: 1 } },
      { fields: { organizationId: 1, email: 1 } },
      { fields: { organizationId: 1, isDeleted: 1 } },
      { fields: { organizationId: 1, status: 1 } },
      { fields: { organizationId: 1, stage: 1 } }
    ]
  }
);

const relatedContactSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    firstName: { type: String },
    lastName: { type: String },
    label: { type: String },
    address: { type: Schema.Types.Mixed },
    phone: { type: Schema.Types.Mixed },
    email: { type: Schema.Types.Mixed },
    contactId: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date },
  },
  {
    collection: "related_contact",
    indexes: [
      { fields: { contactId: 1 } },
      { fields: { organizationId: 1 } }
    ]
  }
);

const linkedContactSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    contact1Id: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    contact1Relation: { type: String },
    contact2Id: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    contact2Relation: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date }
  },
  {
    collection: "linked_contact",
    indexes: [
      { fields: { contact1Id: 1 } },
      { fields: { contact2Id: 1 } },
      { fields: { organizationId: 1 } },
      { fields: { contact1Id: 1, contact2Id: 1, organizationId: 1 }, options: { unique: true } }
    ]
  }
);

const Contact = model("Contact", contactSchema);
const RelatedContact = model("RelatedContact", relatedContactSchema);
const LinkedContact = model("LinkedContact", linkedContactSchema);

export { Contact, RelatedContact, LinkedContact };

