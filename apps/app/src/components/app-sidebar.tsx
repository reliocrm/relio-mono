import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { OrganizationSelector } from "./organization-selector";
import { NavMain } from "./nav-main";
import { NavFavorites } from "./nav-favorites";
import { useParams } from "@tanstack/react-router";
import { NavRecords } from "./nav-records";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isFloating?: boolean;
}

export function AppSidebar({ isFloating, ...props }: AppSidebarProps) {
  const params = useParams({ strict: false });
  const slug = (params.slug as string) || '';

  return (
    <Sidebar variant={isFloating ? "floating" : undefined} {...props}>
      <SidebarHeader className="border-b p-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between gap-2 w-full">
              <OrganizationSelector isFloating={isFloating ?? false} />
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain slug={slug} isFloating={isFloating} />
        <SidebarSeparator className="group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mb-8 hidden" />
        <NavFavorites slug={slug} />
        <NavRecords slug={slug} />
      </SidebarContent>
    </Sidebar>
  )
}
