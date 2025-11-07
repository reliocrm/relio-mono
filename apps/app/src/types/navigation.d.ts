export interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: string;
    label?: string;
    description?: string;
    recordType?: string;
    notification?: number;
    items?: NavItem[];
  }