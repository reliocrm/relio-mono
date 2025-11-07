"use client"

import type { NavItem } from "@/types/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { recordItems } from '@/constants/navigation'
import { IconChevronDown, IconFile, IconCubePlus } from "@tabler/icons-react"
import { getIcon } from "@/lib/icons"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { getRecordIcon } from "@/lib/records"
import { useState } from "react"

const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, value);
  }
};

export function NavRecords({
  slug
}: {
  slug: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const sidebar = useSidebar();
  const isCollapsed = sidebar?.state === "collapsed";
  const [isRecordsHovered, setIsRecordsHovered] = useState(false);

  const handleViewChange = (viewType: string) => {
    const viewTypeLower = viewType.toLowerCase();
    const storageValue = viewTypeLower.includes('map') ? 'map' : 'list';
    
    console.log(`Setting view type: ${viewType} -> ${storageValue}`);
    setLocalStorage('relio:properties_view', storageValue);
    
    if (pathname.endsWith(`/${slug}/properties`)) {
      // Force re-render by navigating to the same route
      navigate({ to: `/${slug}/properties` as any, replace: true });
    } else {
      navigate({ to: `/${slug}/properties` as any });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup className={cn(isCollapsed && "!mt-6")}>
            <SidebarGroupLabel
              className="group-data-[collapsible=icon]:opacity-100 !p-0"
              onMouseEnter={() => setIsRecordsHovered(true)}
              onMouseLeave={() => setIsRecordsHovered(false)}
            >
              <CollapsibleTrigger
                className={cn(
                  "h-8 flex items-center px-2 rounded-lg w-full cursor-pointer transition-colors duration-200",
                  "hover:bg-accent hover:text-accent-foreground mb-1",
                )}
              >
                <div className="flex items-center justify-between w-full">
                  {isCollapsed ? (
                    <IconFile className="h-4 w-4" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <IconChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      <span className="text-xs">Records</span>
                    </div>
                  )}
                  {isRecordsHovered && !isCollapsed && (
                    <IconCubePlus
                      className="h-4 w-4 text-muted-foreground hover:text-accent-foreground cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle add record action here if needed
                      }}
                    />
                  )}
                </div>
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarMenu>
                {recordItems.map((item: NavItem, index: number) => {
                  const isActive = pathname.startsWith(`/${slug}/${item.recordType}`);
                  const href = item.recordType === 'contacts' 
                    ? `/${slug}/` 
                    : `/${slug}/${item.recordType}/`;

                  return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton 
                      tooltip={item.title}
                      className={cn(
                        "group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center",
                      )}
                      asChild
                    >
                      <Link
                        to={(href as any)}
                        className={cn(
                          "transition-colors duration-200",
                          isActive && "bg-accent text-accent-foreground",
                          "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {getRecordIcon(item.recordType as string)}
                        <span className="group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem: NavItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            {item.recordType === 'properties' ? (
                              <Link 
                                to={(`/${slug}/${item.recordType}/` as any)}
                                onClick={() => {
                                  handleViewChange(subItem.title);
                                }}
                              >
                                {getIcon(subItem.icon as string, { className: "size-4" })}
                                <span className="group-data-[collapsible=icon]:hidden">
                                  {subItem.title}
                                </span>
                              </Link>
                            ) : (
                              <a href={subItem.href}>{subItem.title}</a>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                  </SidebarMenuItem>
                )})}
              </SidebarMenu>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
