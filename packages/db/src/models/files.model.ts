import mongoose from "mongoose";
import { FileTypeEnum, PermissionRoleEnum } from "../lib/types";

const { Schema, model } = mongoose;

const folderSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		description: { type: String },
		parentId: { type: Schema.Types.ObjectId, ref: "Folder" },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		scope: { type: String },
		isOpen: { type: Boolean, default: true },
		googleDriveId: { type: String },
		isPublic: { type: Boolean, default: false },
		createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
		isDeleted: { type: Boolean, default: false },
		deletedAt: { type: Date },
		deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "folder",
		indexes: [
			{ fields: { organizationId: 1 } },
			{ fields: { organizationId: 1, parentId: 1 } },
			{ fields: { organizationId: 1, isDeleted: 1 } },
			{ fields: { organizationId: 1, name: 1 } },
			{ fields: { organizationId: 1, scope: 1 } },
			{ fields: { googleDriveId: 1 } }
		]
	}
);

const fileSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		name: { type: String, required: true },
		originalName: { type: String, required: true },
		description: { type: String },
		size: { type: Number, required: true },
		mimeType: { type: String, required: true },
		fileType: { type: String, enum: FileTypeEnum, required: true },
		extension: { type: String },
		url: { type: String, required: true },
		edgeStoreUrl: { type: String },
		thumbnailUrl: { type: String },
		folderId: { type: Schema.Types.ObjectId, ref: "Folder" },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		googleDriveId: { type: String },
		googleDriveUrl: { type: String },
		isPublic: { type: Boolean, default: false },
		version: { type: Number, default: 1 },
		parentFileId: { type: Schema.Types.ObjectId, ref: "File" },
		uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
		lastAccessedAt: { type: Date },
		lastAccessedBy: { type: Schema.Types.ObjectId, ref: "User" },
		downloadCount: { type: Number, default: 0 },
		isDeleted: { type: Boolean, default: false },
		deletedAt: { type: Date },
		deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "file",
		indexes: [
			{ fields: { organizationId: 1 } },
			{ fields: { organizationId: 1, folderId: 1 } },
			{ fields: { organizationId: 1, fileType: 1 } },
			{ fields: { organizationId: 1, isDeleted: 1 } },
			{ fields: { organizationId: 1, name: 1 } },
			{ fields: { googleDriveId: 1 } },
			{ fields: { uploadedBy: 1 } },
			{ fields: { parentFileId: 1 } }
		]
	}
);

const folderPermissionSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		folderId: { type: Schema.Types.ObjectId, ref: "Folder", required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		role: { type: String, enum: PermissionRoleEnum, required: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "folder_permission",
		indexes: [
			{ fields: { folderId: 1, userId: 1 }, options: { unique: true } },
			{ fields: { userId: 1 } }
		]
	}
);

const filePermissionSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		role: { type: String, enum: PermissionRoleEnum, required: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "file_permission",
		indexes: [
			{ fields: { fileId: 1, userId: 1 }, options: { unique: true } },
			{ fields: { userId: 1 } }
		]
	}
);

const fileAttachmentSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },
		attachedToId: { type: Schema.Types.ObjectId, required: true },
		attachedToType: { type: String, required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
		description: { type: String },
		attachedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date },
	},
	{
		collection: "file_attachment",
		indexes: [
			{ fields: { attachedToId: 1, attachedToType: 1 } },
			{ fields: { fileId: 1 } },
			{ fields: { organizationId: 1 } },
			{ fields: { attachedBy: 1 } }
		]
	}
);

const googleDriveIntegrationSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId },
		organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, unique: true },
		accessToken: { type: String, required: true },
		refreshToken: { type: String, required: true },
		tokenExpiresAt: { type: Date, required: true },
		scope: { type: String, required: true },
		googleAccountId: { type: String, required: true },
		googleEmail: { type: String, required: true },
		isEnabled: { type: Boolean, default: true },
		syncFolderId: { type: String },
		lastSyncAt: { type: Date },
		syncStatus: { type: String, default: "idle" },
		syncError: { type: String },
		connectedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		createdAt: { type: Date, default: () => new Date() },
		updatedAt: { type: Date }
	},
	{
		collection: "google_drive_integration",
		indexes: [
			{ fields: { googleAccountId: 1 } },
			{ fields: { organizationId: 1 }, options: { unique: true } }
		]
	}
);

const Folder = model("Folder", folderSchema);
const File = model("File", fileSchema);
const FolderPermission = model("FolderPermission", folderPermissionSchema);
const FilePermission = model("FilePermission", filePermissionSchema);
const FileAttachment = model("FileAttachment", fileAttachmentSchema);
const GoogleDriveIntegration = model("GoogleDriveIntegration", googleDriveIntegrationSchema);

export {
	Folder,
	File,
	FolderPermission,
	FilePermission,
	FileAttachment,
	GoogleDriveIntegration,
};


