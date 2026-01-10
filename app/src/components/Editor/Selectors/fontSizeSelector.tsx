import React from 'react';
import { useState, useRef, useEffect, useCallback, type MouseEvent } from "react";
import type { MenuListProps } from '@mui/material/MenuList';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ChevronDown } from "lucide-react";
import { useEditor } from "novel";

const FONT_OPTIONS = [
  { label: 'Small', value: '0.8rem' },
  { label: 'Normal', value: '1rem' },
  { label: 'Large', value: '1.25rem' },
  { label: 'XL', value: '1.5rem' },
];

export const FontSizeSelector = ({ onOpenChange }: { onOpenChange: (o: boolean) => void }) => {
  const { editor } = useEditor();
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setEditorBubbleMenuOpen_local = (open: boolean) => {
    const el = typeof document !== 'undefined' ? document.querySelector('.editor-bubble') as HTMLElement | null : null;
    if (!el) return;
    if (open) el.setAttribute('data-menu-open', 'font-size-selector');
    else el.removeAttribute('data-menu-open');
  };

  const openMenu = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    // place the menu just below the toolbar with a small offset (use viewport coords)
    // center the menu horizontally under the trigger by using its center x
    setAnchorPos({ top: Math.round(rect.bottom + 8), left: Math.round(rect.left + rect.width / 2) });
    setEditorBubbleMenuOpen_local(true);
    onOpenChange(true);
  }, [onOpenChange, setAnchorPos]);

  const handleClose = useCallback(() => {
    setAnchorPos(null);
    setEditorBubbleMenuOpen_local(false);
    onOpenChange(false);
  }, [onOpenChange, setAnchorPos]);

  // typed list props for MUI Menu to avoid using `any` and set data-menu-name via ref
  const listProps: MenuListProps & { ref?: (el: HTMLUListElement | null) => void } = {
    onMouseDown: (e: MouseEvent<HTMLUListElement>) => e.preventDefault(),
    ref: (el: HTMLUListElement | null) => { if (el) el.setAttribute('data-menu-name', 'font-size-selector'); }
  };

  useEffect(() => {
    if (anchorPos && process.env.NODE_ENV !== 'production') {
      console.log('Popover mounted', { anchorPos });
      const el = document.elementFromPoint(Math.round(anchorPos.left), Math.round(anchorPos.top));
      if (el && !(el as HTMLElement).closest('[data-menu-name="font-size-selector"]')) {
        console.warn('Menu overlap detected (font-size)', { found: el?.tagName, classes: (el as HTMLElement)?.className });
        const delta = 10;
        console.log('Nudging node/font-size menu by', delta);
        window.requestAnimationFrame(() => setAnchorPos((p) => p ? { top: p.top + delta, left: p.left } : p));
      }
    }
  }, [anchorPos, setAnchorPos]);

  if (!editor) return null;

  return (
    <>
      <Button size="small" ref={triggerRef} onMouseDown={(e) => e.preventDefault()} onClick={openMenu} variant="text" sx={{ minWidth: 'auto', p: '6px' }} className="gap-2 rounded-none">
        <span style={{ fontSize: '0.9rem' }}>A</span>
        <ChevronDown />
      </Button>

      <Menu
        open={!!anchorPos}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPos ? { top: Math.round(anchorPos.top), left: Math.round(anchorPos.left) } : undefined}
        // ensure menu opens downward from the anchor position, centered on the trigger
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ list: listProps, paper: { sx: { p: 0, position: 'fixed' as const, borderRadius: 1, minWidth: 96, overflow: 'visible', zIndex: 1800 } } }}
        container={typeof document !== 'undefined' ? document.body : undefined}
      >
        {FONT_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => {
              editor.chain().focus().setMark('fontSize', { fontSize: opt.value }).run();
              handleClose();
            }}
          >
            <Typography sx={{ fontSize: opt.value }}>{opt.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
