import { initEdgeStore } from "@edgestore/server";

const es = initEdgeStore.create();

export const edgeStoreRouter = es.router({
	publicFiles: es.fileBucket().beforeDelete(() => {
		return true;
	}),
	avatars: es.imageBucket({
		maxSize: 1024 * 1024 * 4, // 4MB
		accept: ['image/jpeg', 'image/png'],
	}).beforeDelete(() => {
		return true;
	}),
	// File management buckets
	documents: es.fileBucket({
		maxSize: 1024 * 1024 * 50, // 50MB
		accept: [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'text/plain',
			'text/csv',
			'application/rtf',
		],
	}).beforeDelete(() => {
		return true;
	}),
	images: es.imageBucket({
		maxSize: 1024 * 1024 * 10, // 10MB
		accept: [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml',
			'image/bmp',
			'image/tiff',
		],
	}).beforeDelete(() => {
		return true;
	}),
	videos: es.fileBucket({
		maxSize: 1024 * 1024 * 500, // 500MB
		accept: [
			'video/mp4',
			'video/mpeg',
			'video/quicktime',
			'video/x-msvideo',
			'video/webm',
			'video/x-ms-wmv',
		],
	}).beforeDelete(() => {
		return true;
	}),
	audio: es.fileBucket({
		maxSize: 1024 * 1024 * 100, // 100MB
		accept: [
			'audio/mpeg',
			'audio/wav',
			'audio/mp3',
			'audio/mp4',
			'audio/aac',
			'audio/ogg',
			'audio/webm',
		],
	}).beforeDelete(() => {
		return true;
	}),
	archives: es.fileBucket({
		maxSize: 1024 * 1024 * 100, // 100MB
		accept: [
			'application/zip',
			'application/x-rar-compressed',
			'application/x-7z-compressed',
			'application/x-tar',
			'application/gzip',
		],
	}).beforeDelete(() => {
		return true;
	}),
	other: es.fileBucket({
		maxSize: 1024 * 1024 * 25, // 25MB
		// Accept any file type not covered by other buckets
	}).beforeDelete(() => {
		return true;
	}),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;

export type CreateBucketHandler = (
	name: string,
	options?: {
		public?: boolean;
	},
) => Promise<void>;

export type GetSignedUploadUrlHandler = (
	path: string,
	options: {
		bucket: string;
	},
) => Promise<string>;

export type GetSignedUrlHander = (
	path: string,
	options: {
		bucket: string;
		expiresIn?: number;
	},
) => Promise<string>;

// File type utilities
export type FileCategory = 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'other';

export const getFileCategoryFromMimeType = (mimeType: string): FileCategory => {
	if (mimeType.startsWith('image/')) {
		return 'images';
	}
	if (mimeType.startsWith('video/')) {
		return 'videos';
	}
	if (mimeType.startsWith('audio/')) {
		return 'audio';
	}

	// Document types
	const documentTypes = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-powerpoint',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'text/plain',
		'text/csv',
		'application/rtf',
	];

	if (documentTypes.includes(mimeType)) {
		return 'documents';
	}

	// Archive types
	const archiveTypes = [
		'application/zip',
		'application/x-rar-compressed',
		'application/x-7z-compressed',
		'application/x-tar',
		'application/gzip',
	];

	if (archiveTypes.includes(mimeType)) {
		return 'archives';
	}

	return 'other';
};

export const getFileExtension = (filename: string): string => {
	const lastDotIndex = filename.lastIndexOf('.');
	return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1).toLowerCase() : '';
};

export const getFileTypeFromExtension = (extension: string): FileCategory => {
	const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
	const videoExtensions = ['mp4', 'mpeg', 'mov', 'avi', 'webm', 'wmv'];
	const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'webm'];
	const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'];
	const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];

	if (imageExtensions.includes(extension)) return 'images';
	if (videoExtensions.includes(extension)) return 'videos';
	if (audioExtensions.includes(extension)) return 'audio';
	if (documentExtensions.includes(extension)) return 'documents';
	if (archiveExtensions.includes(extension)) return 'archives';

	return 'other';
};
