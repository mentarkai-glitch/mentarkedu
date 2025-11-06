import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border-2 px-3 py-1 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/50 hover:from-yellow-300 hover:to-yellow-400",
        secondary:
          "border-transparent bg-gray-800 text-white border-gray-700 shadow-lg hover:bg-gray-700",
        destructive:
          "border-transparent bg-red-600 text-white shadow-lg shadow-red-600/50 hover:bg-red-500",
        outline: "text-yellow-400 border-yellow-400 bg-transparent hover:bg-yellow-400/10",
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
