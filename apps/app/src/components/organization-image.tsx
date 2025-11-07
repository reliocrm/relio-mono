import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface OrganizationImageProps {
	name?: string
	image?: string | null
	logo?: string | null
	color?: string
	className?: string
	size?: "sm" | "md" | "lg" | number
}

const sizeMap = {
	sm: "w-4 h-4 !rounded-sm !text-[10px]",
	md: "w-8 h-8",
	lg: "w-12 h-12",
}

export const OrganizationImage = ({
	name,
	image,
	logo,
	color,
	className,
	size = "sm",
}: OrganizationImageProps) => {
	const imageUrl = image || logo
	const sizeClass = typeof size === "number" ? undefined : sizeMap[size]
	const sizeStyle = typeof size === "number" ? { width: size, height: size } : undefined

	return (
		<Avatar className={cn(sizeClass, "rounded-lg", className)} style={sizeStyle}>
			<AvatarImage
				className={cn(sizeClass, "rounded-lg bg-muted")}
				src={imageUrl || undefined}
				alt={name}
			/>
			<AvatarFallback className={cn(sizeClass, "rounded-lg")} style={{ backgroundColor: color }}>
				{name?.charAt(0)?.toUpperCase() || "?"}
			</AvatarFallback>
		</Avatar>
	)
}

