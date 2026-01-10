import React from 'react';
import type { MouseEvent } from 'react';
import type { MenuListProps } from '@mui/material/MenuList';
import {
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  TextQuote,
  ListOrdered,
  TextIcon,
  Code,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { EditorInstance, useEditor } from "novel";
import Menu from '@mui/material/Menu';
import { useSafeState } from '@/hooks/useSafeState.hook';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: EditorInstance) => void;
  isActive: (editor: EditorInstance) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) => editor.chain().focus().clearNodes().run(),
    isActive: (editor) =>
      editor.isActive("paragraph") &&
      !editor.isActive("bulletList") &&
      !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: Code,
    command: (editor) =>
      editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
];
interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ onOpenChange }: NodeSelectorProps) => {
  const [anchorPos, setAnchorPos] = useSafeState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const { editor } = useEditor();

  const setEditorBubbleMenuOpen = (open: boolean, name?: string) => {
    const el = typeof document !== 'undefined' ? document.querySelector('.editor-bubble') as HTMLElement | null : null;
    if (!el) return;
    if (open) el.setAttribute('data-menu-open', name || 'true');
    else el.removeAttribute('data-menu-open');
  };

  const handleOpen = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    // increase the vertical offset so the menu appears clearly below the toolbar
    setAnchorPos({ top: Math.round(rect.bottom + 16), left: Math.round(rect.left) });
    setEditorBubbleMenuOpen(true, 'node-selector');
    onOpenChange(true);
  }, [onOpenChange, setAnchorPos]);

  const handleClose = React.useCallback(() => {
    setAnchorPos(null);
    setEditorBubbleMenuOpen(false);
    onOpenChange(false);
  }, [onOpenChange, setAnchorPos]);

  React.useEffect(() => {
    if (anchorPos && process.env.NODE_ENV !== 'production') {
      console.log('Popover mounted', { anchorPos });
      const centerX = Math.round(anchorPos.left + 10);
      const centerY = Math.round(anchorPos.top + 10);
      // elementFromPoint expects viewport coordinates
      const el = document.elementFromPoint(centerX, centerY);
      if (el && !(el as HTMLElement).closest('[data-menu-name="node-selector"]')) {
        console.warn('Menu overlap detected (node-selector)', { found: el?.tagName, classes: (el as HTMLElement)?.className });
        const delta = 12;
        console.log('Nudging node-selector by', delta);
        // nudge asynchronously
        window.requestAnimationFrame(() => setAnchorPos((p) => p ? { top: p.top + delta, left: p.left } : p));
      }
    }
  }, [anchorPos, setAnchorPos]);

  // typed list props for MUI Menu to avoid using `any` and to set data-menu-name via ref
  const listProps: MenuListProps & { ref?: (el: HTMLUListElement | null) => void } = {
    onMouseDown: (e: MouseEvent<HTMLUListElement>) => e.preventDefault(),
    ref: (el: HTMLUListElement | null) => { if (el) el?.setAttribute('data-menu-name', 'node-selector'); }
  };

  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? { name: "Multiple" };

  return (
    <>
      <Button
        ref={triggerRef}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleOpen}
        size="small"
        variant="text"
        sx={{ minWidth: 'auto', p: '6px' }}
        className="gap-2 rounded-none border-none hover:bg-accent focus:ring-0"
      >
        <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      <Menu
        open={!!anchorPos}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPos ? { top: Math.round(anchorPos.top), left: Math.round(anchorPos.left) } : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ list: listProps, paper: { sx: { p: 0, position: 'fixed' as const, zIndex: 5000 } } }}
        container={typeof document !== 'undefined' ? document.body : undefined}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.command(editor);
              handleClose();
            }}
            selected={activeItem.name === item.name}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 22 }}>
                <item.icon className="h-3 w-3" />
              </Box>
              <Typography variant="body2">{item.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
