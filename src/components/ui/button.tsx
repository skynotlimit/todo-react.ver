import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "destructive" | "subtle";
type Size = "default" | "sm" | "icon";

const variantStyles: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80",
  outline:
    "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:opacity-90",
  subtle: "bg-muted text-foreground hover:bg-accent",
};

const sizeStyles: Record<Size, string> = {
  default: "h-9 px-4 text-sm rounded-md",
  sm: "h-8 px-3 text-xs rounded-md",
  icon: "h-9 w-9 rounded-md",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 select-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
