import React from 'react';
import type { MouseEvent } from 'react';
import type { MenuListProps } from '@mui/material/MenuList';
import { Check, ChevronDown } from "lucide-react";
import { useEditor } from "novel";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const setEditorBubbleMenuOpen = (open: boolean, name?: string) => {
  const el = typeof document !== 'undefined' ? document.querySelector('.editor-bubble') as HTMLElement | null : null;
  if (!el) return;
  if (open) el.setAttribute('data-menu-open', name || 'true');
  else el.removeAttribute('data-menu-open');
};

export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-black)",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
  {
    name: "Pink",
    color: "#BA4081",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-highlight-default)",
  },
  {
    name: "Purple",
    color: "var(--novel-highlight-purple)",
  },
  {
    name: "Red",
    color: "var(--novel-highlight-red)",
  },
  {
    name: "Yellow",
    color: "var(--novel-highlight-yellow)",
  },
  {
    name: "Blue",
    color: "var(--novel-highlight-blue)",
  },
  {
    name: "Green",
    color: "var(--novel-highlight-green)",
  },
  {
    name: "Orange",
    color: "var(--novel-highlight-orange)",
  },
  {
    name: "Pink",
    color: "var(--novel-highlight-pink)",
  },
  {
    name: "Gray",
    color: "var(--novel-highlight-gray)",
  },
];

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({ onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();
  const [anchorPos, setAnchorPos] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const handleOpen = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setAnchorPos({ top: Math.round(rect.bottom + 8), left: Math.round(rect.left) });
    setEditorBubbleMenuOpen(true, 'color-selector');
    onOpenChange(true);
  }, [onOpenChange, setAnchorPos]);

  const handleClose = React.useCallback(() => {
    setAnchorPos(null);
    setEditorBubbleMenuOpen(false);
    onOpenChange(false);
  }, [onOpenChange, setAnchorPos]);

  // typed list props for MUI Menu to avoid using `any` and to set data-menu-name via ref
  const listProps: MenuListProps & { ref?: (el: HTMLUListElement | null) => void } = {
    onMouseDown: (e: MouseEvent<HTMLUListElement>) => e.preventDefault(),
    ref: (el: HTMLUListElement | null) => { if (el) el.setAttribute('data-menu-name', 'color-selector'); }
  };

  React.useEffect(() => {
    if (anchorPos && process.env.NODE_ENV !== 'production') {
      console.log('Popover mounted', { anchorPos });
      const el = document.elementFromPoint(Math.round(anchorPos.left), Math.round(anchorPos.top));
      if (el && !(el as HTMLElement).closest('[data-menu-name="color-selector"]')) {
        console.warn('Menu overlap detected (color-selector)', { found: el?.tagName, classes: (el as HTMLElement)?.className });
        const delta = 8;
        console.log('Nudging color menu by', delta);
        // nudge asynchronously to avoid setState-in-effect lint rule
        window.requestAnimationFrame(() => setAnchorPos((p) => p ? { top: p.top + delta, left: p.left } : p));
      }
    }
  }, [anchorPos, setAnchorPos]);

  if (!editor) return null;

  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color }),
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color }),
  );

  return (
    <>
      <Button size="small" ref={triggerRef} onMouseDown={(e) => e.preventDefault()} onClick={handleOpen} variant="text" sx={{ minWidth: 'auto', p: '6px' }} className="gap-2 rounded-none">
        <span
          className="rounded-sm px-1"
          style={{
            color: activeColorItem?.color,
            backgroundColor: activeHighlightItem?.color,
          }}
        >
          A
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      <Menu
        open={!!anchorPos}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPos ? { top: Math.round(anchorPos.top), left: Math.round(anchorPos.left) } : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ list: listProps, paper: { sx: { p: 0, position: 'fixed' as const, zIndex: 1800 } } }}
        container={typeof document !== 'undefined' ? document.body : undefined}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
          <Typography variant="subtitle2" sx={{ px: 1 }}>Color</Typography>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                editor.commands.unsetColor();
                if (name !== "Default") {
                  editor.chain().focus().setColor(color || "").run();
                }
                handleClose();
              }}
              sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ borderRadius: '2px', px: 1, py: 0.25, fontWeight: 600, color }} component="span">A</Box>
                <Typography variant="body2">{name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
          <Typography variant="subtitle2" sx={{ px: 1 }}>Background</Typography>
          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                editor.commands.unsetHighlight();
                if (name !== "Default") {
                  editor.chain().focus().setHighlight({ color }).run();
                }
                handleClose();
              }}
              sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ borderRadius: '2px', px: 1, py: 0.25, fontWeight: 600, backgroundColor: color }} component="span">A</Box>
                <Typography variant="body2">{name}</Typography>
              </Box>
              {editor.isActive("highlight", { color }) && (
                <Check />
              )}
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};
