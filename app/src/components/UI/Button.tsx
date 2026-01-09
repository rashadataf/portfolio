import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonProps = Omit<MuiButtonProps, "color" | "size" | "variant"> & {
  variant?: Variant; // compatible with original prop name
  size?: ButtonSize; // compatible size names used throughout the app
  asChild?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", children, sx, asChild = false, ...props }, ref) => {
    const mapping: Record<Variant, { variant: MuiButtonProps["variant"]; color?: string }> = {
      default: { variant: "contained", color: "primary" },
      destructive: { variant: "contained", color: "error" },
      outline: { variant: "outlined", color: "primary" },
      secondary: { variant: "contained", color: "secondary" },
      ghost: { variant: "text", color: "inherit" },
      link: { variant: "text", color: "primary" },
    };

    const sizeMap: Record<ButtonSize, MuiButtonProps["size"]> = {
      default: "medium",
      sm: "small",
      lg: "large",
      icon: "medium",
    };

    const m = mapping[variant];
    const muiSize = sizeMap[size];

    const extraSx = size === "icon" ? { minWidth: 40, width: 40, height: 40, padding: 0 } : {};

    if (asChild) {
      return (
        <Slot>
          <MuiButton variant={m.variant} color={m.color as any} size={muiSize} sx={{ ...extraSx, ...(sx as any) }} ref={ref as any} {...(props as any)}>
            {children}
          </MuiButton>
        </Slot>
      );
    }

    return (
      <MuiButton variant={m.variant} color={m.color as any} size={muiSize} sx={{ ...extraSx, ...(sx as any) }} ref={ref as any} {...(props as any)}>
        {children}
      </MuiButton>
    );
  }
);
Button.displayName = "Button";

export { Button };
