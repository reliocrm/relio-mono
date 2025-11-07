import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface NavigationButtonProps extends React.ComponentProps<typeof Button> {
  /** The icon to display in the button */
  icon: LucideIcon | TablerIcon;
  /** Optional count to display in a badge */
  count?: number;
  /** Custom icon className */
  iconClassName?: string;
  /** Badge variant */
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  /** Whether to show badge even when count is 0 */
  showZeroBadge?: boolean;
  /** Position of the badge */
  badgePosition?: "top-right" | "inline" | "bottom-right" | "bottom-left";
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Optional tooltip text to display on hover */
  tooltip?: string | React.ReactNode;
  /** Optional route to navigate to when the button is clicked */
  route?: string;
  /** Optional navigate function to navigate to the route */
  navigate?: () => void;
}

export const NavigationButton = React.forwardRef<HTMLButtonElement, NavigationButtonProps>(
  (
    {
      icon: Icon,
      count,
      iconClassName = "stroke-1",
      badgeVariant = "destructive",
      showZeroBadge = false,
      badgePosition = "top-right",
      ariaLabel,
      tooltip,
      className,
      variant = "outline",
      size = "icon",
      navigate,
      ...props
    },
    ref
  ) => {
    const shouldShowBadge = count !== undefined && (count > 0 || showZeroBadge);
    const displayCount = count && count > 99 ? "99+" : count;

    const button = (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("relative", className)}
        aria-label={ariaLabel}
        onClick={() => navigate && navigate()}
        {...props}
      >
        <Icon className={iconClassName} />
        {shouldShowBadge && badgePosition === "top-right" && (
          <Badge
            variant={badgeVariant}
            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs"
          >
            {displayCount}
          </Badge>
        )}
        {shouldShowBadge && badgePosition === "inline" && (
          <Badge variant={badgeVariant} className="ml-auto">
            {displayCount}
          </Badge>
        )}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

NavigationButton.displayName = "NavigationButton";