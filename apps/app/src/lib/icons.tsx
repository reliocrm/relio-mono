import * as React from "react";
import {
  IconLayoutDashboard,
  IconSquareRoundedCheck,
  IconBell,
  IconUsers,
  IconBuildingStore,
  IconBriefcase,
  IconUserCircle,
  IconMail,
  IconBuilding,
  IconUsersGroup,
  IconCreditCard,
  IconPackage,
  IconPlug,
  IconDownload,
  IconGitBranch,
  IconList,
  IconMap,
  IconFile,
} from "@tabler/icons-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";

const iconMap: Record<string, TablerIcon> = {
  dashboard: IconLayoutDashboard,
  tasks: IconSquareRoundedCheck,
  notesPage: IconFile,
  bell: IconBell,
  users: IconUsers,
  properties: IconBuildingStore,
  companies: IconBriefcase,
  circleUser: IconUserCircle,
  email: IconMail,
  organization: IconBuilding,
  team: IconUsersGroup,
  billing: IconCreditCard,
  plans: IconPackage,
  integrations: IconPlug,
  import: IconDownload,
  pipeline: IconGitBranch,
  list: IconList,
  map: IconMap,
};

export function getIcon(
  iconName: string,
  props?: React.ComponentProps<TablerIcon>
): React.ReactElement | null {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }
  return <IconComponent {...props} />;
}

export { iconMap };

