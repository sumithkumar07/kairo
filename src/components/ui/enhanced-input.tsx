import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Search, X } from "lucide-react"

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        filled: "bg-muted border-transparent",
        ghost: "border-transparent bg-transparent hover:bg-muted/50",
        success: "border-green-500 focus-visible:ring-green-500",
        error: "border-red-500 focus-visible:ring-red-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-10 px-4 py-2",
        xl: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  clearable?: boolean
  error?: string
  helper?: string
  label?: string
  floatingLabel?: boolean
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = "text",
    leftIcon,
    rightIcon,
    loading,
    clearable,
    error,
    helper,
    label,
    floatingLabel,
    onClear,
    value,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!value)

    React.useEffect(() => {
      setHasValue(!!value)
    }, [value])

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
    }

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type === "password" && showPassword ? "text" : type}
          className={cn(
            inputVariants({ variant: error ? "error" : variant, size, className }),
            leftIcon && "pl-10",
            (rightIcon || clearable || type === "password") && "pr-10",
            floatingLabel && "pt-6 pb-2"
          )}
          ref={ref}
          value={value}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value)
            props.onChange?.(e)
          }}
          {...props}
        />

        {floatingLabel && label && (
          <label
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              (isFocused || hasValue)
                ? "top-2 text-xs text-primary"
                : "top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground",
              leftIcon && "left-10"
            )}
          >
            {label}
          </label>
        )}

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {rightIcon && !clearable && type !== "password" && (
            <div className="text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    )

    if (label && !floatingLabel) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
          {inputElement}
          {(error || helper) && (
            <p className={cn(
              "text-xs",
              error ? "text-red-500" : "text-muted-foreground"
            )}>
              {error || helper}
            </p>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-1">
        {inputElement}
        {(error || helper) && (
          <p className={cn(
            "text-xs",
            error ? "text-red-500" : "text-muted-foreground"
          )}>
            {error || helper}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Search Input Component
const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "leftIcon" | "type"> & {
    onSearch?: (value: string) => void
  }
>(({ onSearch, ...props }, ref) => {
  const [searchValue, setSearchValue] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="h-4 w-4" />}
        placeholder="Search..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        clearable
        onClear={() => setSearchValue("")}
        {...props}
      />
    </form>
  )
})
SearchInput.displayName = "SearchInput"

// Textarea with similar styling
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    variant?: "default" | "filled" | "ghost"
    resize?: "none" | "vertical" | "horizontal" | "both"
    error?: string
    helper?: string
    label?: string
  }
>(({ className, variant = "default", resize = "vertical", error, helper, label, ...props }, ref) => {
  const variantClasses = {
    default: "border-input",
    filled: "bg-muted border-transparent",
    ghost: "border-transparent bg-transparent hover:bg-muted/50",
  }

  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  }

  const textareaElement = (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        resizeClasses[resize],
        error && "border-red-500 focus-visible:ring-red-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )

  if (label) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        {textareaElement}
        {(error || helper) && (
          <p className={cn(
            "text-xs",
            error ? "text-red-500" : "text-muted-foreground"
          )}>
            {error || helper}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {textareaElement}
      {(error || helper) && (
        <p className={cn(
          "text-xs",
          error ? "text-red-500" : "text-muted-foreground"
        )}>
          {error || helper}
        </p>
      )}
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Input, SearchInput, Textarea, inputVariants }