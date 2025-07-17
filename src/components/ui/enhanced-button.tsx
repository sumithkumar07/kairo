import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "btn-gradient shadow-lg hover:shadow-xl",
        glass: "btn-glass shadow-sm hover:shadow-md",
        glow: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105",
        premium: "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105",
        success: "bg-green-500 text-white shadow hover:bg-green-600",
        warning: "bg-yellow-500 text-white shadow hover:bg-yellow-600",
        info: "bg-blue-500 text-white shadow hover:bg-blue-600",
        minimal: "hover:bg-muted/50 transition-colors duration-200",
        floating: "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 fixed z-50",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
        floating: "h-14 w-14 rounded-full",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        scale: "interactive-scale",
        glow: "interactive-glow",
        float: "animate-float",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale",
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  badge?: string | number
  tooltip?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    fullWidth,
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    badge,
    tooltip,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const buttonContent = (
      <>
        {loading && <Loader2 className="animate-spin" />}
        {!loading && leftIcon && <span className="mr-1">{leftIcon}</span>}
        <span className="flex-1">{children}</span>
        {!loading && rightIcon && <span className="ml-1">{rightIcon}</span>}
        {badge && (
          <span className="notification-badge">
            {badge}
          </span>
        )}
      </>
    )

    if (tooltip) {
      return (
        <div className="relative group">
          <Comp
            className={cn(buttonVariants({ variant, size, animation, fullWidth, className }))}
            ref={ref}
            disabled={disabled || loading}
            {...props}
          >
            {buttonContent}
          </Comp>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltip}
          </div>
        </div>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }