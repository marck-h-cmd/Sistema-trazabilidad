import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary dark:text-white",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gray-700 dark:text-gray-200",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-red-900/50 dark:text-red-300",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80 dark:bg-green-900/50 dark:text-green-300",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 dark:bg-yellow-900/50 dark:text-yellow-300",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80 dark:bg-blue-900/50 dark:text-blue-300",
        outline: "text-foreground dark:border-gray-600 dark:text-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }