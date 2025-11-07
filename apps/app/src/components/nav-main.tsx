"use client"

import { useMemo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { NavItem } from "@/types/navigation"
import { getIcon } from "@/lib/icons"
import Notifications from "@/components/notifications";
import { cn } from '@/lib/utils';
import { navItems } from '@/constants/navigation';

const addSlugToNavItems = (navItems: NavItem[], slug: string): NavItem[] => {
	return navItems.map(item => ({
		...item,
		href: `/${slug}${item.href}`
	}));
};

export function NavMain({
  slug,
  isFloating,
}: {
  slug: string
  isFloating?: boolean
}) {
  const location = useLocation();
  const itemsWithSlug = useMemo(() => addSlugToNavItems(navItems, slug), [slug]);

  return (
    <SidebarGroup>
      <SidebarMenu className="-gap-2">
        <Notifications isFloating={isFloating} />
        {itemsWithSlug.map((item) => {
          // Normalize paths for comparison (remove trailing slashes)
          const currentPath = location.pathname.replace(/\/$/, '');
          const itemPath = (item.href as string).replace(/\/$/, '');
          
          // Exact match only - ensures only the correct item is highlighted
          const isActive = currentPath === itemPath;
          
          return (
            <Link
              key={item.title}
              to={item.href || '#'}
              preload="intent"
              disabled={item.disabled}
            >
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip={item.title}
                  disabled={item.disabled}
                  className={cn(
                    "transition-colors duration-200",
                    isActive && "bg-accent text-accent-foreground",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {getIcon(item.icon as string, { 
                    className: cn(
                      "size-4",
                      isActive && "text-accent-foreground"
                    )
                  })}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
