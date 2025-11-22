import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-extrabold shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/60 hover:opacity-90",
        destructive:
          "bg-error text-white shadow-error/50 hover:opacity-90",
        outline:
          "border-2 border-primary bg-transparent text-primary font-bold hover:bg-primary/10 hover:border-primary/80 hover:text-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-secondary font-bold hover:opacity-90",
        ghost: "text-foreground font-semibold hover:bg-muted hover:text-foreground",
        link: "text-primary font-bold underline-offset-4 hover:underline hover:text-primary/90",
      },
      size: {
        default: "h-12 px-6 py-3 text-base min-h-[48px]",
        sm: "h-10 rounded-lg px-4 text-sm min-h-[44px]",
        lg: "h-14 rounded-xl px-10 text-lg min-h-[56px]",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  suppressHydrationWarning?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, suppressHydrationWarning, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        suppressHydrationWarning={suppressHydrationWarning !== false}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
