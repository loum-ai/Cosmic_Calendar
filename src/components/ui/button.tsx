import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.94]",
  {
    variants: {
      variant: {
        // primary CTA — the iridescent gradient, dark text
        cta: "bg-cta-gradient text-space-2 font-semibold shadow-glow",
        glass:
          "bg-white/[0.06] border border-lilac/30 text-ink-soft backdrop-blur-md hover:border-lilac/60",
        ghost: "text-ink-soft/80 hover:text-ink hover:bg-white/[0.06]",
        icon: "bg-white/[0.06] border border-white/[0.12] text-ink-soft/80 hover:bg-white/[0.1]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "h-11 w-11 rounded-full",
        iconLg: "h-[54px] w-[54px] rounded-full",
      },
    },
    defaultVariants: { variant: "glass", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
