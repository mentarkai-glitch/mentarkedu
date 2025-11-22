import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border-2 px-3 py-1 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background min-h-[32px]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/40 hover:shadow-primary/60",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground border-border shadow-md hover:opacity-90",
        destructive:
          "border-transparent bg-error text-white shadow-md shadow-error/40 hover:opacity-90",
        outline: "text-primary border-primary bg-transparent hover:bg-primary/10 hover:border-primary/80",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
