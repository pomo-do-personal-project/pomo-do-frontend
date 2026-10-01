import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variantStyles = {
      primary: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white shadow-sm",
      secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
      outline: "border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
      ghost: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-4 py-2 rounded-xl gap-2",
      lg: "text-base px-6 py-3 rounded-2xl gap-2.5",
      icon: "p-2.5 rounded-xl aspect-square",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
