const ChatStatusEnum = [
  "ready",
  "submitted",
  "streaming",
] as const;
type ChatStatus = (typeof ChatStatusEnum)[number];

const ToolEnum = [
  "searchWeb",
  "searchContacts",
  "searchProperties",
  "searchCompanies",
  "getTaskSummary",
  "getAnalytics",
  "getRecentActivity",
  "createTask",
] as const;
type Tool = (typeof ToolEnum)[number];

const ObjectViewTypeEnum = {
  TABLE: "table",
  KANBAN: "kanban",
  MAP: "map",
} as const;
type ObjectViewType = (typeof ObjectViewTypeEnum)[keyof typeof ObjectViewTypeEnum];

const ModelCapabilityEnum = [
  "thinking",
  "vision",  
  "tools"
] as const;
type ModelCapability = (typeof ModelCapabilityEnum)[number];

const ModelProviderEnum = [
  "azure",
  "openrouter"
] as const;
type ModelProvider = (typeof ModelProviderEnum)[number];

const NotificationTypeEnum = [
  "general",
  "task_assigned",
  "task_completed",
  "mention",
  "system",
] as const;
type NotificationType = (typeof NotificationTypeEnum)[number];

const PurchaseTypeEnum = [
  "subscription",
  "one_time",
] as const;
type PurchaseType = (typeof PurchaseTypeEnum)[number];

const TagRoleEnum = [
  "viewer",
  "editor",
  "admin",
] as const;
type TagRole = (typeof TagRoleEnum)[number];

const ListRoleEnum = [
  "viewer",
  "editor",
  "admin",
] as const;
type ListRole = (typeof ListRoleEnum)[number];

const TaskStatusEnum = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
] as const;
type TaskStatus = (typeof TaskStatusEnum)[number];

const TaskPriorityEnum = [
  "no_priority",
  "urgent",
  "high",
  "medium",
  "low",
] as const;
type TaskPriority = (typeof TaskPriorityEnum)[number];

const EmailSourceTypeEnum = [
  "connected_account",
  "forwarded",
  "manual",
] as const;
type EmailSourceType = (typeof EmailSourceTypeEnum)[number];

const EmailDirectionEnum = [
  "inbound",
  "outbound",
] as const;
type EmailDirection = (typeof EmailDirectionEnum)[number];

const ActivityTypeEnum = [
  "note",
  "call",
  "email",
  "meeting",
  "task",
  "system",
] as const;
type ActivityType = (typeof ActivityTypeEnum)[number];

const FileTypeEnum = [
  "document",
  "image",
  "video",
  "audio",
  "archive",
  "other",
] as const;
type FileType = (typeof FileTypeEnum)[number];

const PermissionRoleEnum = [
  "viewer",
  "editor",
  "admin",
] as const;
type PermissionRole = (typeof PermissionRoleEnum)[number];

export type { PermissionRole, ModelCapability, ModelProvider, Tool, ChatStatus, ObjectViewType, PurchaseType, TagRole, ListRole, TaskStatus, TaskPriority, EmailSourceType, EmailDirection, ActivityType, FileType, NotificationType};
export { NotificationTypeEnum, ModelCapabilityEnum, ModelProviderEnum, ToolEnum, ChatStatusEnum, ObjectViewTypeEnum, PurchaseTypeEnum, TagRoleEnum, ListRoleEnum, TaskStatusEnum, TaskPriorityEnum, EmailSourceTypeEnum, EmailDirectionEnum, ActivityTypeEnum, FileTypeEnum, PermissionRoleEnum };
