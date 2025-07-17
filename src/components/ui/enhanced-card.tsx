import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border",
        premium: "card-premium",
        glass: "card-glass",
        gradient: "bg-gradient-to-br from-card via-card/95 to-card/90",
        glow: "shadow-lg shadow-primary/10 hover:shadow-primary/20",
        elevated: "shadow-lg hover:shadow-xl",
        minimal: "border-none shadow-none bg-transparent",
        outlined: "border-2 border-primary/20 bg-transparent",
        floating: "shadow-2xl hover:shadow-3xl",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
        compact: "p-3",
      },
      hover: {
        none: "",
        lift: "card-hover",
        glow: "hover:shadow-lg hover:shadow-primary/20",
        scale: "hover:scale-[1.02]",
        rotate: "hover:rotate-1",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "lift",
      interactive: false,
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, hover, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size, hover, interactive, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    divider?: boolean
    centered?: boolean
  }
>(({ className, divider, centered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      divider && "border-b border-border pb-4",
      centered && "text-center items-center",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: "sm" | "default" | "lg" | "xl"
    gradient?: boolean
  }
>(({ className, size = "default", gradient, ...props }, ref) => {
  const sizeClasses = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        sizeClasses[size],
        gradient && "text-gradient",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "sm" | "default" | "lg"
    muted?: boolean
  }
>(({ className, size = "default", muted = true, ...props }, ref) => {
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  }

  return (
    <p
      ref={ref}
      className={cn(
        sizeClasses[size],
        muted && "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean
  }
>(({ className, noPadding, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      !noPadding && "p-6 pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    divider?: boolean
    centered?: boolean
  }
>(({ className, divider, centered, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      divider && "border-t border-border pt-4",
      centered && "justify-center",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Enhanced Card Components
const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
    icon?: React.ReactNode
    loading?: boolean
  }
>(({ className, title, value, change, trend = "neutral", icon, loading, ...props }, ref) => {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground"
  }

  return (
    <Card ref={ref} className={cn("dashboard-card", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div className="p-3 bg-primary/10 rounded-xl">
              {icon}
            </div>
          )}
          {change && (
            <div className={cn("text-sm font-medium", trendColors[trend])}>
              {change}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-muted rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-foreground">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
StatsCard.displayName = "StatsCard"

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon: React.ReactNode
    title: string
    description: string
    badge?: string
    color?: string
  }
>(({ className, icon, title, description, badge, color = "from-blue-500 to-blue-600", ...props }, ref) => (
  <Card ref={ref} className={cn("card-hover", className)} {...props}>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-4 rounded-xl bg-gradient-to-r text-white", color)}>
          {icon}
        </div>
        {badge && (
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
    </CardContent>
  </Card>
))
FeatureCard.displayName = "FeatureCard"

const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string
    value: number
    max?: number
    unit?: string
    color?: string
    showProgress?: boolean
  }
>(({ className, label, value, max = 100, unit = "%", color = "bg-primary", showProgress = true, ...props }, ref) => (
  <Card ref={ref} className={cn("card-hover", className)} {...props}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold">{value}{unit}</span>
      </div>
      {showProgress && (
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={cn("h-2 rounded-full transition-all duration-500", color)}
            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          />
        </div>
      )}
    </CardContent>
  </Card>
))
MetricCard.displayName = "MetricCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  StatsCard,
  FeatureCard,
  MetricCard,
  cardVariants 
}