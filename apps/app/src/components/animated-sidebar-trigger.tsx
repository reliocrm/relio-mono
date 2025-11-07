"use client";

import { AnimatePresence, motion } from "motion/react";
import { PanelLeftClose } from "@/components/animate-ui/icons/panel-left-close";
import { PanelLeftOpen } from "@/components/animate-ui/icons/panel-left-open";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimateIcon } from "./animate-ui/icons/icon";

interface AnimatedSidebarTriggerProps {
	className?: string;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	isFloating?: boolean;
}

export function AnimatedSidebarTrigger({
	className,
	onClick,
	isFloating,
	...props
}: AnimatedSidebarTriggerProps & React.ComponentProps<typeof Button>) {
	const { toggleSidebar, state } = useSidebar();
	// When floating, show right arrow (collapsed state) even if local context says expanded
	const isExpanded = isFloating ? false : state === "expanded";

	return (
		<Button
			data-sidebar="trigger"
			data-slot="sidebar-trigger"
			variant="ghost"
			size="icon"
			className={cn("size-7 relative overflow-hidden", className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<AnimatePresence mode="wait" initial={false}>
				{isExpanded ? (
					<AnimateIcon animateOnHover>
					<PanelLeftClose size={16} />
				  </AnimateIcon>
				) : (
					<AnimateIcon animateOnHover>
						<PanelLeftOpen />
					</AnimateIcon>
				)}
			</AnimatePresence>
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
}

