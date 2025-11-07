import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "@/components/animate-ui/icons/check";

import { cn } from "@/lib/utils";

function Checkbox({
	className,
	checked: controlledChecked,
	defaultChecked,
	onCheckedChange,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	const [uncontrolledChecked, setUncontrolledChecked] = React.useState(
		defaultChecked ?? false
	);
	const isControlled = controlledChecked !== undefined;
	const checked = isControlled ? controlledChecked : uncontrolledChecked;

	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"peer relative cursor-pointer border-input dark:bg-input/30 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-sm border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			checked={controlledChecked}
			defaultChecked={defaultChecked}
			onCheckedChange={(newChecked) => {
				if (!isControlled) {
					setUncontrolledChecked(newChecked === true);
				}
				onCheckedChange?.(newChecked);
			}}
			{...props}
		>
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<Check 
					size={10} 
					animate={checked === true}
					className={cn(
						"transition-opacity duration-300",
						checked ? "opacity-100" : "opacity-0"
					)}
				/>
			</div>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="absolute inset-0 flex items-center justify-center text-current transition-none pointer-events-none"
				asChild
			>
				<div aria-hidden="true" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
