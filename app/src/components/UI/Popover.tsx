"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { 'data-menu-name'?: string }
>(({ className, align = "center", sideOffset = 4, 'data-menu-name': menuName, children, ...props }, ref) => {
  const paperRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      >
        <Paper
          elevation={3}
          ref={paperRef}
          data-menu-name={menuName}
          onMouseDown={(e) => e.preventDefault()}
          sx={{ position: 'fixed', zIndex: (theme) => theme.zIndex.modal + 200, overflow: 'visible' }}
        >
          <Box sx={{ p: 1 }}>{children}</Box>
        </Paper>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
