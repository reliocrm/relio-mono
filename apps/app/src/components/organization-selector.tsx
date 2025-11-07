"use client"

import { useState, useRef } from "react";
import { Avatar } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator, DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IconBrush, IconLogout, IconPlus, IconSettingsCog, IconSquareRoundedCheckFilled, IconUserCircle } from "@tabler/icons-react";
import { OrganizationImage } from "@/components/organization-image";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatedSidebarTrigger } from "@/components/animated-sidebar-trigger";

// Utility function to truncate text
const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + "...";
};

export const OrganizationSelector = ({ isFloating }: { isFloating: boolean }) => {
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const params = useParams({ strict: false });
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const sidebarTriggerRef = useRef<HTMLDivElement>(null);
	const sidebarTriggerClicked = useRef(false);

	// Get current organization from route slug
	const currentOrganization = useQuery({
		...trpc.organization.getCurrentOrganization.queryOptions({
			slug: params.slug as string,
		}),
		enabled: !!params.slug,
	});

	// Get all user organizations
	const allOrganizations = useQuery(
		trpc.organization.getUserOrganizations.queryOptions({
			status: "active",
		})
	);

	const organization = currentOrganization.data;
	const organizations = allOrganizations.data || [];

	const handleSignOut = () => {
		console.log("Sign Out");
	}

	const handleSelection = (value: string) => {
		setOpen(false);

		switch (value) {
			case "create":
				return navigate({ to: "/organizations/create" });
			case "account":
				return console.log("Account Settings");
			case "settings":
				return console.log("Organization Settings");
			case "sign-out":
				return handleSignOut();
			default:
				return;
		}
	};

	const menuItems = [
		{
			icon: <IconPlus />,
			onClick: () => handleSelection("create"),
			text: "Create New Organization",
			separator: true,
		},
		{
			icon: <IconUserCircle />,
			onClick: () => handleSelection("account"),
			text: "Account Settings",
			disabled: true,
		},
		{
			icon: <IconSettingsCog />,
			onClick: () => handleSelection("settings"),
			text: "Organization Settings",
			disabled: true,
		},
		{
			icon: <IconBrush />,
			onClick: () => handleSelection("theme"),
			text: "Theme",
			submenu: [
				{
					text: "Light",
					onClick: () => setTheme("light"),
				},
				{
					text: "Dark",
					onClick: () => setTheme("dark"),
				},
				{
					text: "System",
					onClick: () => setTheme("system"),
				},
			],
			separator: true,
		},
		{
			icon: <IconLogout />,
			onClick: () => handleSelection("sign-out"),
			text: "Sign Out",
		},
	];

	// const handleToggle = () => {
	// 	toggle();
	// 	setLocalStorage('relio:sidebar-open', isMinimized.toString())
	// };

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<div>
					<DropdownMenu
						open={open}
						onOpenChange={(newOpen) => {
							// Don't open if the click came from the sidebar trigger
							if (newOpen && sidebarTriggerClicked.current) {
								sidebarTriggerClicked.current = false;
								return;
							}
							setOpen(newOpen);
						}}
					>
						<DropdownMenuTrigger
							onPointerDown={(e) => {
								const target = e.target as HTMLElement;
								if (target.closest('[data-slot="sidebar-trigger"]') || 
								    target.closest('[data-sidebar="trigger"]') ||
								    sidebarTriggerRef.current?.contains(target)) {
									e.preventDefault();
									e.stopPropagation();
									return;
								}
							}}
							asChild
						>
							<div className="flex items-center cursor-pointer justify-between w-full py-2 px-1 group/org-selector transition-colors hover:bg-sidebar-accent/50 [&:has([data-sidebar=trigger])]:hover:bg-sidebar-accent/50 [&:has([data-sidebar=trigger]:hover)]:bg-transparent">
								<SidebarMenuButton
									className={cn(
										"py-0 h-full flex-1 min-w-0 rounded-none hover:bg-transparent cursor-pointer",
									)}>
									<div className='flex flex-row items-center w-full h-full min-w-0'>
										<OrganizationImage
											name={organization?.name}
											logo={organization?.logo}
											size="md"
										/>

										<span className={`ml-2 truncate group-data-[state=collapsed]:hidden`}>
											{
												organization?.name && organization.name.length > 20 ?
													<Tooltip>
														<TooltipTrigger>
															{truncate(organization.name, 20)}
														</TooltipTrigger>
														<TooltipContent>
															{organization.name}
														</TooltipContent>
													</Tooltip>
													:
													organization?.name
											}
										</span>
									</div>
								</SidebarMenuButton>
								<div 
									ref={sidebarTriggerRef}
									className="shrink-0"
									onPointerDown={(e) => {
										sidebarTriggerClicked.current = true;
										e.stopPropagation();
									}}
									onClick={(e) => {
										sidebarTriggerClicked.current = true;
										e.stopPropagation();
									}}
								>
									<AnimatedSidebarTrigger 
										isFloating={isFloating}
										onClick={(e) => {
											sidebarTriggerClicked.current = true;
											e.stopPropagation();
										}}
									/>
								</div>
							</div>
						</DropdownMenuTrigger>

						<DropdownMenuContent 
							className={cn(
								"w-80 rounded-xl mr-0 ml-1",
								isFloating && "z-[101]"
							)}
						>
							<DropdownMenuGroup>
								{organizations
									?.sort((a, b) => {
										if (a._id?.toString() === organization?._id?.toString()) return -1;
										if (b._id?.toString() === organization?._id?.toString()) return 1;
										return 0;
									})
									.map((org) => {
										if (!org._id || !org.slug) return null;
										return (
											<DropdownMenuItem
												onClick={async () => {
													setOpen(false);
													// Invalidate organization and view queries to ensure fresh data for the new organization
													await queryClient.invalidateQueries({
														predicate: (query) => {
															const queryKey = query.queryKey;
															// Check if query key starts with 'organization' or 'view'
															if (Array.isArray(queryKey) && queryKey[0] && Array.isArray(queryKey[0])) {
																const firstKey = queryKey[0][0];
																return firstKey === 'organization' || firstKey === 'view';
															}
															return false;
														},
													});
													// Navigate to the new organization
													navigate({ to: `/${org.slug}` });
												}}
												className='rounded-lg'
												key={org._id.toString()}
											>
											<OrganizationImage
												name={org.name}
												logo={org.logo}
												size="sm"
											/>
												{org.name}
												<DropdownMenuShortcut className="opacity-100">
													{org._id?.toString() === organization?._id?.toString() && (
														<IconSquareRoundedCheckFilled className="h-4 w-4 text-orange-400" />
													)}
												</DropdownMenuShortcut>
											</DropdownMenuItem>
										);
									})}
								<DropdownMenuSeparator />
							</DropdownMenuGroup>
							<DropdownMenuGroup>
								{menuItems.map((item, index) => (
									<div key={index}>
										{!item.submenu && (
											<DropdownMenuItem className='rounded-lg' onClick={item.onClick} disabled={item.disabled}>
												<div className="flex items-center gap-3">
													<Avatar className='h-4 w-4'>
														{item.icon}
													</Avatar>
													{item.text}
												</div>
											</DropdownMenuItem>
										)}

										{item.submenu && (
											<DropdownMenuSub>
												<DropdownMenuSubTrigger className='rounded-lg'>
													<div className="flex flex-row items-center justify-between w-full">
														<div className="flex items-center gap-3">
															<Avatar className='h-4 w-4'>
																{item.icon}
															</Avatar>
															{item.text}
														</div>
														<span className="text-[10px] text-muted-foreground code-font mr-1">
															{(theme ?? '').charAt(0).toUpperCase() + (theme ?? '').slice(1)}
														</span>
													</div>
												</DropdownMenuSubTrigger>
												<DropdownMenuSubContent className={cn('rounded-xl', isFloating && "z-[102]")}>
													{item.submenu.map((subitem, subindex) => (
														<DropdownMenuItem key={subindex} onClick={subitem.onClick} className='rounded-lg'>
															<div className="flex items-center justify-between w-full">
																{subitem.text}
																{theme === subitem.text.toLowerCase() && (
																	<IconSquareRoundedCheckFilled className="ml-2 h-4 w-4 text-orange-400" />
																)}
															</div>
														</DropdownMenuItem>
													))}
												</DropdownMenuSubContent>
											</DropdownMenuSub>
										)}

										{item.separator && <DropdownMenuSeparator />}
									</div>
								))}

							</DropdownMenuGroup>
						</DropdownMenuContent>

					</DropdownMenu>
				</div>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
