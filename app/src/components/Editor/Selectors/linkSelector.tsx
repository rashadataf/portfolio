import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent
} from "react";
import type { MenuListProps } from '@mui/material/MenuList';
import { useEditor } from "novel";
import { Check, Trash } from "lucide-react";

import { cn } from "@/lib/utils";
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.log('error@isValidUrl: ', e);
    return false;
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (e) {
    console.log('error@getUrlFromString: ', e);
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({ onOpenChange }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();
  const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const setEditorBubbleMenuOpen_local = (open: boolean) => {
    const el = typeof document !== 'undefined' ? document.querySelector('.editor-bubble') as HTMLElement | null : null;
    if (!el) return;
    if (open) el.setAttribute('data-menu-open', 'link-selector');
    else el.removeAttribute('data-menu-open');
  };

  const handleOpen = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setAnchorPos({ top: Math.round(rect.bottom + 8), left: Math.round(rect.left) });
    setEditorBubbleMenuOpen_local(true);
    onOpenChange(true);
  }, [onOpenChange, setAnchorPos]);

  const handleClose = useCallback(() => {
    setAnchorPos(null);
    setEditorBubbleMenuOpen_local(false);
    onOpenChange(false);
  }, [onOpenChange, setAnchorPos]);

  const listProps: MenuListProps & { ref?: (el: HTMLUListElement | null) => void } = {
    onMouseDown: (e: MouseEvent<HTMLUListElement>) => e.preventDefault(),
    ref: (el: HTMLUListElement | null) => { if (el) el.setAttribute('data-menu-name', 'link-selector'); }
  };

  useEffect(() => { if (inputRef.current) { inputRef.current?.focus(); } }, [anchorPos]);

  if (!editor) return null;

  return (
    <>
      <Button ref={triggerRef} size="small" onMouseDown={(e) => e.preventDefault()} onClick={handleOpen} variant="text" sx={{ minWidth: 'auto', p: '6px' }} className="gap-2 rounded-none border-none">
        <p className="text-base">↗</p>
        <p className={cn("underline decoration-stone-400 underline-offset-4", { "text-blue-500": editor.isActive("link") })}>Link</p>
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
        <Box component="form" sx={{ p: 1 }} onSubmit={(e) => {
          e.preventDefault();
          const url = getUrlFromString(inputRef.current?.value || '');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
            handleClose();
          }
        }}>
          <TextField
            inputRef={inputRef}
            placeholder="Paste a link"
            size="small"
            fullWidth
            slotProps={{ htmlInput: { dir: 'ltr' } }}
            defaultValue={editor.getAttributes('link').href || ''}
          />

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {editor.getAttributes('link').href ? (
              <Button variant="outlined" color="error" onClick={() => { editor.chain().focus().unsetLink().run(); handleClose(); }}>
                <Trash />
              </Button>
            ) : (
              <Button variant="contained" type="submit"><Check /></Button>
            )}
          </Box>
        </Box>
      </Menu>
    </>
  );
};
