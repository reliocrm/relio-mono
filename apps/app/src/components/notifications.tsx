"use client"

import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import { useSidebar } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationProps {
	isMobileNav?: boolean;
	isFloating?: boolean;
}

const Notifications = ({ isMobileNav = false, isFloating = false }: NotificationProps) => {
	const { state } = useSidebar();
	const isMinimized = state === "collapsed";
	const [isOpen, setIsOpen] = useState(false);

	// TODO: Replace with actual notification hooks
	const notifications: any[] = [];
	const requests: any[] = [];
	const archived: any[] = [];
	const isLoading = false;

	const unreadNotifications = notifications.filter((n) => !n.read);
	const unreadRequests = requests.filter((r) => !r.read);
	const totalUnread = unreadNotifications.length + unreadRequests.length;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger className="w-full" asChild>
						<SidebarMenuButton 
							tooltip={'Notifications'} 
							className={cn(
								"!w-full",
								isOpen && "bg-sidebar-accent text-sidebar-accent-foreground"
							)}
						>
							<Bell className="size-4" />
							<span>Notifications</span>
							{/* Expanded State */}
							{totalUnread > 0 && (
								<div className="flex items-center pr-3">
									<Badge variant="default" className="bg-indigo-600 text-white">
										{totalUnread}
									</Badge>
								</div>
							)}
							{/* Collapsed State */}
							{totalUnread > 0 && (
								<div className="absolute left-4 z-20 size-3 text-[8px] text-accent-foreground rounded-full bg-indigo-700">
									{totalUnread}
								</div>
							)}
						</SidebarMenuButton>
					</PopoverTrigger>
					<PopoverContent 
						side='right' 
						align="start" 
						sideOffset={8}
						alignOffset={isFloating ? -10 : 0}
						className={cn(
							"ml-2 min-h-[600px] max-h-[800px] w-[500px] z-50 -top-14"
						)}
						style={{
							position: "absolute",
							...(isFloating ? { top: -64 } : {}),
						}}
					>
						<div className="flex flex-row items-center justify-between">
							<h2 className={'text-xl'}>Notifications</h2>
							{unreadNotifications.length > 0 && (
								<span
									className="text-xs text-muted-foreground hover:underline cursor-pointer"
									onClick={() => {
										// TODO: Implement mark all as read
										console.log("Mark all as read");
									}}
								>
									Mark all as read
								</span>
							)}
						</div>
						<Tabs defaultValue="notifications">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="notifications">Notifications ({unreadNotifications.length})</TabsTrigger>
								<TabsTrigger value="request">Requests ({unreadRequests.length})</TabsTrigger>
								<TabsTrigger value="archived">Archived ({archived?.length || 0})</TabsTrigger>
							</TabsList>
							<TabsContent value="notifications" className="border-t dark:border-zinc-800 border-zinc-200">
								{isLoading ? (
									<div className="space-y-2 p-4">
										<Skeleton className="h-16 w-full" />
										<Skeleton className="h-16 w-full" />
									</div>
								) : unreadNotifications.length === 0 ? (
									<div className='flex space-y-4 items-center justify-center flex-col p-4'>
										<div className='flex flex-col items-center justify-center align-center'>
											<span>No Notifications</span>
											<span className='text-sm text-muted-foreground'>We&lsquo;ll notify you here about activities linked to your account.</span>
										</div>
									</div>
								) : (
									<div className="p-2">
										{unreadNotifications.map((notification) => (
											<div key={notification._id || notification.id} className="p-2 py-4 border-b border-zinc-800">
												<p className="text-sm font-medium dark:text-zinc-200">
													{notification.message}
												</p>
											</div>
										))}
									</div>
								)}
							</TabsContent>
							<TabsContent value="request" className="border-t dark:border-zinc-800 border-zinc-200">
								{isLoading ? (
									<div className="space-y-2 p-4">
										<Skeleton className="h-16 w-full" />
									</div>
								) : unreadRequests.length === 0 ? (
									<div className='flex space-y-4 items-center justify-center flex-col p-4'>
										<div className='flex flex-col items-center justify-center align-center'>
											<span>No Requests</span>
											<span className='text-sm text-muted-foreground'>We&lsquo;ll notify you here about requests from other users.</span>
										</div>
									</div>
								) : (
									<div className="p-2">
										{unreadRequests.map((request) => (
											<div key={request._id || request.id} className="p-2 py-4 border-b border-zinc-800">
												<p className="text-sm font-medium dark:text-zinc-200">
													{request.message}
												</p>
											</div>
										))}
									</div>
								)}
							</TabsContent>
							<TabsContent value="archived" className="border-t dark:border-zinc-800 border-zinc-200">
								{isLoading ? (
									<div className="space-y-2 p-4">
										<Skeleton className="h-16 w-full" />
									</div>
								) : archived.length === 0 ? (
									<div className='flex space-y-4 items-center justify-center flex-col p-4'>
										<div className='flex flex-col items-center justify-center align-center'>
											<span>No Archived Notifications</span>
											<span className='text-sm text-muted-foreground'>
												You have no archived notifications.
											</span>
										</div>
									</div>
								) : (
									<div className="p-2">
										{archived.map((item) => (
											<div key={item._id || item.id} className="p-2 py-4 border-b border-zinc-800">
												<p className="text-sm font-medium dark:text-zinc-200">
													{item.message}
												</p>
											</div>
										))}
									</div>
								)}
							</TabsContent>
						</Tabs>
					</PopoverContent>
				</Popover>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}

export default Notifications

