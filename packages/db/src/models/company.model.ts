import mongoose from "mongoose";

const { Schema, model } = mongoose;

const companySchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		website: { type: String },
		industry: { type: String },
		size: { type: String },
		description: { type: String },
		logo: { type: String },
		address: { type: Schema.Types.Mixed },
		phone: { type: String },
		email: { type: String },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
		isDeleted: { type: Boolean, default: false },
		deletedAt: { type: Date },
		deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{ collection: "company" },
);

const Company = model("Company", companySchema);

export { Company };


