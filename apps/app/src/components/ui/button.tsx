import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
import type { LucideIcon } from "lucide-react";
export type IconComponent = React.ComponentType<LucideIcon>;

function isComponentType(value: any): value is React.ComponentType {
	return typeof value === 'function' || (typeof value === 'object' && value !== null && 'render' in value);
  }

const buttonVariants = cva(
	"inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				filter:
					"border border-dashed bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				action:
					"border bg-background shadow-xs shadow-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 !h-7 !px-1 gap-1 rounded-lg",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? SlotPrimitive.Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode | IconComponent
  tooltip?: string
  side?: "top" | "bottom" | "left" | "right"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ icon, className, onClick, tooltip, side = "top", ...props }, ref) => {
	  const IconElement = React.isValidElement(icon)
	  ? icon
	  : isComponentType(icon)
	  ? React.createElement(icon)
	  : null;
  
	  return (
		<Tooltip>
		  <TooltipTrigger>
		<Button
		  size='icon'
		  className={cn('relative flex !h-6 !w-6 size-7 items-center justify-center rounded-lg border dark:border-muted border-zinc-300 !bg-transparent dark:!hover:bg-muted hover:!bg-zinc-300 dark:hover:!bg-zinc-700 text-zinc-500 dark:text-zinc-500 hover:!text-zinc-900 dark:hover:!text-zinc-50', className)}
		  onClick={onClick}
		  ref={ref}
		  {...props}
		>
		  <div>
			{IconElement}
		  </div>
		</Button>
		</TooltipTrigger>
		{tooltip && (
		<TooltipContent side={side}>
		  {tooltip}
		</TooltipContent>
		)}
		</Tooltip>
	  )}
  );
  IconButton.displayName = 'IconButton';

export { Button, buttonVariants, IconButton };
