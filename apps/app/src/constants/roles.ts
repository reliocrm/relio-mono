export const SHARE_ROLES = [
	{ value: "owner", label: "Owner" },
	{ value: "admin", label: "Admin" },
	{ value: "member", label: "Member" },
	{ value: "viewer", label: "Viewer" },
] as const;

export type OrganizationRole = (typeof SHARE_ROLES)[number]["value"];

