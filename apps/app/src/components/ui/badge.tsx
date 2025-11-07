import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

interface NumberBadgeProps {
	number: React.ReactNode;
	className?: string;
	color?:
		| "indigo"
		| "zinc"
		| "blue"
		| "red"
		| "green"
		| "yellow"
		| "purple"
		| "sky";
	variant?: "views";
}

function NumberBadge({
	number,
	className,
	color = "blue",
	variant,
}: NumberBadgeProps) {
	const colorClasses = {
		indigo: "bg-indigo-200 dark:bg-indigo-700 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100",
		zinc: "bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-sidebar dark:text-zinc-100",
		blue: "bg-blue-200 dark:bg-blue-700 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-100",
		red: "bg-red-200 dark:bg-red-700 border-red-300 dark:border-red-600 text-red-900 dark:text-red-100",
		green: "bg-green-200 dark:bg-green-700 border-green-300 dark:border-green-600 text-green-900 dark:text-green-100",
		yellow: "bg-yellow-200 dark:bg-yellow-700 border-yellow-300 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100",
		purple: "bg-purple-200 dark:bg-purple-700 border-purple-300 dark:border-purple-600 text-purple-900 dark:text-purple-100",
		sky: "bg-sky-200 dark:bg-sky-700 border-sky-300 dark:border-sky-600 text-sky-900 dark:text-sky-100",
	};

	return (
		<div
			className={cn(
				"flex items-center justify-center",
				"w-fit px-1 h-4 rounded-sm",
				"border",
				"text-xs font-medium font-mono",
				colorClasses[color],
				className,
			)}
		>
			{number}
		</div>
	);
}

NumberBadge.displayName = "NumberBadge";

export { Badge, badgeVariants, NumberBadge }

