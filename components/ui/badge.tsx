import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary text-primary-foreground",
        outline: "text-foreground",
        success: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        warning: "bg-amber-500/20 text-amber-300 border-amber-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariant = "default" | "primary" | "outline" | "success" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

export { Badge, badgeVariants };
