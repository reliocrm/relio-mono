import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
	children: React.ReactNode;
	className?: string;
	icon?: React.ReactNode;
};

export function Badge({ children, className, icon }: BadgeProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700",
				className,
			)}
		>
			{icon ?? (
				<svg
					aria-hidden
					width="16"
					height="16"
					viewBox="0 0 24 24"
					className="shrink-0"
				>
					<path
						fill="currentColor"
						d="M12 2l1.902 5.854L20 10l-6.098 2.146L12 18l-1.902-5.854L4 10l6.098-2.146z"
					/>
				</svg>
			)}
			<span>{children}</span>
		</div>
	);
}

export default Badge;


