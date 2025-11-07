import type { NavItem } from "@/types/navigation";

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    disabled: true,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: 'tasks',
    label: 'tasks',
    notification: 0,
    disabled: true,
  },
  {
    title: 'Notes',
    href: '/notes',
    icon: 'notesPage',
    label: 'notes',
    disabled: true,
  },
  // {
  //   title: 'Emails',
  //   href: '/emails',
  //   icon: 'emails',
  //   label: 'emails',
  //   notification: 0
  // }
];

export const recordItems: NavItem[] = [
  {
    title: 'Contacts',
    href: '/contacts',
    icon: 'users',
    label: 'Contacts',
    recordType: 'contacts'
  },
  {
    title: "Properties",
    href: "/properties",
    icon: 'properties',
    recordType: 'properties',
  },
  {
    title: 'Companies',
    href: '/companies',
    icon: 'companies',
    label: 'Companies',
    recordType: 'companies'
  }
];

export const accountItems: NavItem[] = [
  {
    title: 'Account',
    href: '/settings/account',
    icon: 'circleUser',
    label: 'Account',
  },
  {
    title: 'Email & Calendar Accounts',
    href: '/settings/account/email-calendar-accounts',
    icon: 'email',
    label: 'Email & Calendar Accounts',
  }
]

export const organizationItems: NavItem[] = [
  {
    title: 'Organization',
    href: '/settings/organization',
    icon: 'organization',
    label: 'Organization',
  },
  {
    title: "Team",
    href: '/settings/organization/team',
    icon: 'team',
    label: 'team',
  },
  {
    title: 'Billing',
    href: '/settings/organization/billing',
    icon: 'billing',
    label: 'Billing',
  },
  {
    title: 'Plans',
    href: '/settings/organization/plans',
    icon: 'plans',
    label: 'Plans',
  },
  {
    title: 'Integrations',
    href: '/settings/organization/integrations',
    icon: 'integrations',
    label: 'Integrations',
  }
]

export const dataItems: NavItem[] = [
  {
    title: 'Import',
    href: '/settings/data/import',
    icon: 'import',
    label: 'Import',
  },
  {
    title: 'Pipelines',
    href: '/settings/data/pipelines',
    icon: 'pipeline',
    label: 'Pipelines',
  }
]

