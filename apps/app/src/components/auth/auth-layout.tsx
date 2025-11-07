"use client";

import type { ReactNode } from "react";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SidebarProvider, SidebarInset, useSidebar } from "../ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "../ui/breadcrumb";
import { AppSidebar } from "../app-sidebar";
import { Separator } from "../ui/separator";
import { AnimatedSidebarTrigger } from "../animated-sidebar-trigger";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
	children: ReactNode;
}

const MIN_WIDTH = 250;
const MAX_WIDTH = 350;
const COLLAPSE_THRESHOLD = 10; // Only collapse when dragged all the way to left edge
const HOVER_AREA_WIDTH = 14;
const SIDEBAR_WIDTH_STORAGE_KEY = "sidebar-width";
const LAST_SIDEBAR_WIDTH_STORAGE_KEY = "last-sidebar-width";

// Load sidebar width from localStorage
function getStoredSidebarWidth(): number {
	if (typeof window === "undefined") return MIN_WIDTH;
	const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
	if (stored) {
		const width = parseInt(stored, 10);
		// Validate stored width
		if (width === 0 || (width >= MIN_WIDTH && width <= MAX_WIDTH)) {
			return width;
		}
	}
	return MIN_WIDTH;
}

// Get the last non-collapsed width (for floating sidebar)
function getLastSidebarWidth(): number {
	if (typeof window === "undefined") return MIN_WIDTH;
	const stored = localStorage.getItem(LAST_SIDEBAR_WIDTH_STORAGE_KEY);
	if (stored) {
		const width = parseInt(stored, 10);
		// Validate stored width
		if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
			return width;
		}
	}
	return MIN_WIDTH;
}

// Save sidebar width to localStorage
function saveSidebarWidth(width: number): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, width.toString());
	// If not collapsed, also save as last width
	if (width >= MIN_WIDTH) {
		localStorage.setItem(LAST_SIDEBAR_WIDTH_STORAGE_KEY, width.toString());
	}
}

const ResizableSidebarWrapper = memo(function ResizableSidebarWrapper({ children }: { children: ReactNode }) {
	const [sidebarWidth, setSidebarWidth] = useState(() => getStoredSidebarWidth());
	const [floatingSidebarWidth, setFloatingSidebarWidth] = useState(() => getLastSidebarWidth());
	const [isResizing, setIsResizing] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const resizeHandleRef = useRef<HTMLDivElement>(null);
	const floatingResizeHandleRef = useRef<HTMLDivElement>(null);
	const sidebarContainerRef = useRef<HTMLDivElement>(null);
	const rafRef = useRef<number | null>(null);
	const isClickingLinkRef = useRef(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const isCollapsed = sidebarWidth < COLLAPSE_THRESHOLD;

	// Save sidebar width to localStorage whenever it changes (but not during resizing)
	useEffect(() => {
		if (!isResizing) {
			saveSidebarWidth(sidebarWidth);
		}
	}, [sidebarWidth, isResizing]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return;

			// Cancel any pending animation frame
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}

			// Use requestAnimationFrame for smoother updates
			rafRef.current = requestAnimationFrame(() => {
				// Calculate new width based on mouse position
				// For regular sidebar: use clientX directly
				// For floating sidebar: subtract the left offset (16px)
				const isFloating = isCollapsed && isHovering;
				const baseX = isFloating ? e.clientX - 10 : e.clientX;
				let newWidth = baseX;

				// Only collapse when dragged all the way to the left edge (for regular sidebar)
				if (!isFloating && newWidth < COLLAPSE_THRESHOLD) {
					setSidebarWidth(0);
					return;
				}

				// For floating sidebar, enforce minimum width - don't allow going below MIN_WIDTH
				if (isFloating) {
					// Clamp to minimum width if below threshold
					if (newWidth < MIN_WIDTH) {
						setFloatingSidebarWidth(MIN_WIDTH);
						return;
					}
					// Snap to max width if near max (within 10px)
					if (newWidth >= MAX_WIDTH - 10) {
						setFloatingSidebarWidth(MAX_WIDTH);
						return;
					}
					// Otherwise, clamp between MIN and MAX
					const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
					setFloatingSidebarWidth(clampedWidth);
					return;
				}

				// For regular sidebar: snap to 350px if resized near that width (within 10px)
				if (newWidth >= MAX_WIDTH - 10) {
					setSidebarWidth(MAX_WIDTH);
					return;
				}

				// Enforce minimum width of 250px - clamp between MIN and MAX
				const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
				setSidebarWidth(clampedWidth);
			});
		},
		[isResizing, isCollapsed, isHovering]
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		
		const isFloating = isCollapsed && isHovering;
		const currentWidth = isFloating ? floatingSidebarWidth : sidebarWidth;
		
		// Ensure minimum width is maintained if not collapsed
		if (!isCollapsed && currentWidth > COLLAPSE_THRESHOLD && currentWidth < MIN_WIDTH) {
			const finalWidth = MIN_WIDTH;
			setSidebarWidth(finalWidth);
			saveSidebarWidth(finalWidth);
		} else if (isFloating) {
			// Save floating sidebar width as last width
			localStorage.setItem(LAST_SIDEBAR_WIDTH_STORAGE_KEY, floatingSidebarWidth.toString());
		} else {
			// Save the current width when resizing ends
			saveSidebarWidth(currentWidth);
		}
	}, [sidebarWidth, floatingSidebarWidth, isCollapsed, isHovering]);

	useEffect(() => {
		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
				// Clean up any pending animation frame
				if (rafRef.current) {
					cancelAnimationFrame(rafRef.current);
				}
			};
		}
	}, [isResizing, handleMouseMove, handleMouseUp]);

	// Initialize floating sidebar width when collapsed
	useEffect(() => {
		if (isCollapsed && floatingSidebarWidth === MIN_WIDTH) {
			const lastWidth = getLastSidebarWidth();
			if (lastWidth !== MIN_WIDTH) {
				setFloatingSidebarWidth(lastWidth);
			}
		}
	}, [isCollapsed, floatingSidebarWidth]);

	useEffect(() => {
		if (!isCollapsed) {
			setIsHovering(false);
			return;
		}

		// Don't run hover detection while resizing
		if (isResizing) {
			return;
		}

		const handleMouseMove = (e: MouseEvent) => {
			// Don't hide if we're clicking a link
			if (isClickingLinkRef.current) {
				return;
			}

			// Clear any pending timeout
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
				hoverTimeoutRef.current = null;
			}

			// Show floating sidebar when mouse is in the left hover area
			if (e.clientX <= HOVER_AREA_WIDTH) {
				setIsHovering(true);
			} 
			// Keep it open if mouse is over the floating sidebar area (accounting for 10px offset)
			else if (isHovering && e.clientX <= floatingSidebarWidth + 10 + 20) {
				setIsHovering(true);
			}
			// Hide when mouse moves beyond the sidebar width, but with a delay
			else if (e.clientX > floatingSidebarWidth + 10 + 20) {
				// Add a delay before hiding to prevent resetting when clicking links
				hoverTimeoutRef.current = setTimeout(() => {
					if (!isClickingLinkRef.current) {
						setIsHovering(false);
					}
				}, 150);
			}
		};

		const handleMouseDown = (e: MouseEvent) => {
			// Check if clicking inside the floating sidebar area
			const target = e.target as HTMLElement;
			const floatingSidebar = document.querySelector('[data-floating-sidebar="true"]');
			
			// Check if click is inside floating sidebar or its trigger area
			if (floatingSidebar && floatingSidebar.contains(target)) {
				isClickingLinkRef.current = true;
				// Clear any pending hide timeout
				if (hoverTimeoutRef.current) {
					clearTimeout(hoverTimeoutRef.current);
					hoverTimeoutRef.current = null;
				}
				// Keep sidebar open
				setIsHovering(true);
			} else if (e.clientX <= floatingSidebarWidth + 10 + 20) {
				// Also check if clicking in the sidebar area by position
				const linkOrButton = target.closest('a, button, [role="button"], [data-sidebar-menu-button]');
				if (linkOrButton) {
					isClickingLinkRef.current = true;
					// Clear any pending hide timeout
					if (hoverTimeoutRef.current) {
						clearTimeout(hoverTimeoutRef.current);
						hoverTimeoutRef.current = null;
					}
					// Keep sidebar open
					setIsHovering(true);
				}
			}
		};

		const handleClick = (e: MouseEvent) => {
			// Prevent sidebar from closing when clicking links
			const target = e.target as HTMLElement;
			const floatingSidebar = document.querySelector('[data-floating-sidebar="true"]');
			
			if (floatingSidebar && floatingSidebar.contains(target)) {
				isClickingLinkRef.current = true;
				setIsHovering(true);
				// Keep sidebar open for longer when clicking links
				setTimeout(() => {
					isClickingLinkRef.current = false;
				}, 500);
			}
		};

		const handleMouseUp = () => {
			// Reset the flag after a longer delay to allow navigation to complete
			setTimeout(() => {
				isClickingLinkRef.current = false;
			}, 300);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mousedown", handleMouseDown, true);
		document.addEventListener("mouseup", handleMouseUp, true);
		document.addEventListener("click", handleClick, true);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mousedown", handleMouseDown, true);
			document.removeEventListener("mouseup", handleMouseUp, true);
			document.removeEventListener("click", handleClick, true);
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
				hoverTimeoutRef.current = null;
			}
		};
	}, [isCollapsed, isHovering, floatingSidebarWidth, isResizing]);

	const leftOffsetPx = isCollapsed ? 0 : sidebarWidth;
	const collapsedOffsetPx = -sidebarWidth;

	return (
		<>
			{/* Floating sidebar - render outside main SidebarProvider to avoid wrapper background */}
			<AnimatePresence>
				{isCollapsed && isHovering && (
					<motion.div
						initial={{ x: -(floatingSidebarWidth + 20), opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: -(floatingSidebarWidth + 20), opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed bg-sidebar border border-sidebar-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
						style={{
							pointerEvents: "auto",
							left: "10px",
							top: "10px",
							bottom: "10px",
							width: `${floatingSidebarWidth}px`,
							transition: isResizing ? "none" : "width 0.2s ease-out",
							zIndex: 100,
						} as React.CSSProperties}
						data-floating-sidebar-container="true"
						onMouseEnter={() => setIsHovering(true)}
						onMouseLeave={() => {
							// Don't close if clicking on a link
							if (isClickingLinkRef.current) {
								return;
							}
							// Let the global mousemove handler manage hiding
							// This prevents flickering when moving between hover area and sidebar
						}}
						onClick={(e) => {
							// Prevent sidebar from closing when clicking links
							const target = e.target as HTMLElement;
							const linkOrButton = target.closest('a, button, [role="button"]');
							if (linkOrButton) {
								isClickingLinkRef.current = true;
								setIsHovering(true);
								// Keep sidebar open for a while after clicking
								setTimeout(() => {
									isClickingLinkRef.current = false;
								}, 1000);
								// Don't prevent default or stop propagation - let TanStack Router handle navigation
							}
						}}
					>
						<SidebarProvider 
							open={true} 
							style={{ "--sidebar-width": `${floatingSidebarWidth}px` } as React.CSSProperties}
							onOpenChange={(open) => {
								// When clicking the trigger in floating sidebar, open the main sidebar
								// The trigger will toggle to false, so we intercept and open main sidebar instead
								if (!open) {
									const lastWidth = getLastSidebarWidth();
									setSidebarWidth(lastWidth);
									saveSidebarWidth(lastWidth);
									setIsHovering(false);
								}
							}}
							data-floating-sidebar="true"
						>
							<AppSidebar isFloating={true} />
						</SidebarProvider>
						{/* Resize handle for floating sidebar */}
						<div
							ref={floatingResizeHandleRef}
							onMouseDown={handleMouseDown}
							className="absolute top-0 bottom-0 right-0 cursor-col-resize z-40 group"
							style={{
								width: "4px",
								touchAction: "none",
								transition: isResizing ? "none" : "all 0.2s ease-out",
							}}
						>
							<div className="absolute inset-y-0 right-1/2 translate-x-1/2 w-1 bg-transparent transition-all group-hover:bg-sidebar-border/50" />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

		<SidebarProvider
				open={!isCollapsed}
				onOpenChange={(open) => {
					if (!open && !isCollapsed) {
						// Save current width as last width before collapsing
						if (sidebarWidth >= MIN_WIDTH) {
							localStorage.setItem(LAST_SIDEBAR_WIDTH_STORAGE_KEY, sidebarWidth.toString());
						}
						setSidebarWidth(0);
						saveSidebarWidth(0);
					} else if (open && isCollapsed) {
						// Restore from last width or use minimum
						const lastWidth = getLastSidebarWidth();
						setSidebarWidth(lastWidth);
						saveSidebarWidth(lastWidth);
					}
				}}
				style={
					{
						"--sidebar-width": isCollapsed ? "0px" : `${sidebarWidth}px`,
						transition: isResizing ? "none" : "width 0.2s ease-out",
					} as React.CSSProperties
				}
				className={cn(
					isCollapsed ? "bg-transparent! [&>div]:bg-transparent!" : "",
					"h-screen overflow-hidden flex"
				)}
				data-main-sidebar-collapsed={isCollapsed}
			>

			{/* Regular sidebar - only render when not collapsed */}
			{!isCollapsed && (
				<div
					ref={sidebarContainerRef}
					data-variant="hover"
					data-collapsed={isCollapsed}
					data-hovering={isHovering}
					className="relative"
      style={
        {
							"--left-offset-px": `${leftOffsetPx}px`,
							"--collapsed-offset-px": `${collapsedOffsetPx}px`,
        } as React.CSSProperties
      }
    >
      <AppSidebar />
					{/* Resize handle - only render when not collapsed */}
					<div
						ref={resizeHandleRef}
						onMouseDown={handleMouseDown}
						className="fixed top-0 bottom-0 cursor-col-resize z-30 group"
						style={{
							left: `${sidebarWidth}px`,
							width: "4px",
							touchAction: "none",
							transition: isResizing ? "none" : "left 0.2s ease-out",
						}}
					>
						<div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-transparent transition-all" />
					</div>
				</div>
			)}
			{/* Hover area when collapsed - render outside container */}
			{isCollapsed && !isHovering && (
				<div
					className="fixed top-0 bottom-0 left-0"
					style={{
						width: `${HOVER_AREA_WIDTH}px`,
						pointerEvents: "auto",
						zIndex: 50,
					}}
					onMouseEnter={() => {
						setIsHovering(true);
					}}
				/>
			)}
			{children}
		</SidebarProvider>
		</>
	);
});

const HeaderContent = memo(function HeaderContent() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
        <header className="sticky top-0 z-50 flex shrink-0 items-center gap-2 border-b p-4">
			{isCollapsed && (
				<>
          <AnimatedSidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
				</>
			)}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Inbox</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
	);
});

const AuthLayout = memo(function AuthLayout({ 
	children, 
}: AuthLayoutProps) {
	return (
		<ResizableSidebarWrapper>
			<SidebarInset className="flex flex-col h-screen overflow-hidden max-h-screen">
				<HeaderContent />
				<div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
					{children}
				</div>
			</SidebarInset>
		</ResizableSidebarWrapper>
	);
});

export default AuthLayout;

