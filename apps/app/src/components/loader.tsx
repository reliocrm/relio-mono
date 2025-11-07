import { Logo } from "@/components/logo";

export default function Loader() {
	return (
		<div className="flex h-full items-center justify-center pt-8 space-x-2">
			<span
				className="inline-flex animate-bounce"
				style={{ animationDuration: "1s" }} // Bounce animation
			>
				<Logo withLabel={false} className="size-8" />
			</span>
		</div>
	);
}
