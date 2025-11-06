import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl text-base font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-extrabold shadow-yellow-500/50 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500",
        destructive:
          "bg-red-600 text-white shadow-red-600/50 hover:bg-red-500",
        outline:
          "border-2 border-yellow-400 bg-transparent text-yellow-400 font-bold hover:bg-yellow-400/10 hover:border-yellow-300 hover:text-yellow-300",
        secondary:
          "bg-gray-800 text-white border-2 border-gray-700 font-bold hover:bg-gray-700 hover:border-gray-600",
        ghost: "text-yellow-400 font-semibold hover:bg-yellow-400/10 hover:text-yellow-300",
        link: "text-yellow-400 font-bold underline-offset-4 hover:underline hover:text-yellow-300",
      },
      size: {
        default: "h-12 px-6 py-3 text-base",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-10 text-lg",
        icon: "h-12 w-12",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
