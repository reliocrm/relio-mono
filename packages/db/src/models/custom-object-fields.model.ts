import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Object-specific custom field definitions for custom objects
const customObjectFieldDefinitionSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		label: { type: String, required: true },
		icon: { type: String },
		type: { type: String, required: true }, // 'string', 'number', 'boolean', 'date', 'array', 'object', 'email', 'phone', 'select', 'multiselect'
		objectType: { type: String, required: true }, // e.g., 'deal', 'project'
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		isRequired: { type: Boolean, default: false },
		isSystem: { type: Boolean, default: false },
		options: { type: Schema.Types.Mixed }, // For select options and meta
		position: { type: Number, default: 0 },
		isActive: { type: Boolean, default: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{ collection: "custom_object_field_definition" },
);

const CustomObjectFieldDefinition = model(
	"CustomObjectFieldDefinition",
	customObjectFieldDefinitionSchema,
);

export { CustomObjectFieldDefinition };



