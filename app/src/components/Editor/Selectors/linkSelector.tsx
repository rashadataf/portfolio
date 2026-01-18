import {
  useEffect,
  useRef,
  useCallback
} from "react";
import { useEditor } from "novel";
import { Check, Trash } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useSafeState } from "@/hooks/useSafeState.hook";

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
  const [open, setOpen] = useSafeState(false);

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setOpen(o);
      onOpenChange(o);
    },
    [onOpenChange, setOpen]
  );

  useEffect(() => { if (inputRef.current) { inputRef.current?.focus(); } }, [open]);

  if (!editor) return null;

  return (
    <Popover.Root modal={true} open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button size="small" onMouseDown={(e) => e.preventDefault()} variant="text" sx={{ minWidth: 'auto', p: '6px' }}>
          <span style={{ fontSize: '1rem' }}>↗</span>
          <span style={{
            textDecoration: 'underline',
            textDecorationColor: 'rgb(120 113 108)',
            textUnderlineOffset: '4px',
            color: editor.isActive("link") ? 'rgb(59 130 246)' : 'inherit'
          }}>Link</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        sideOffset={5}
        align="start"
        className="popover-content"
      >
        <form style={{ padding: '8px' }} onSubmit={(e) => {
          e.preventDefault();
          const url = getUrlFromString(inputRef.current?.value || '');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
            handleOpenChange(false);
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

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {editor.getAttributes('link').href ? (
              <Button variant="outlined" color="error" onClick={() => { editor.chain().focus().unsetLink().run(); handleOpenChange(false); }}>
                <Trash size={16} />
              </Button>
            ) : (
              <Button variant="contained" type="submit"><Check size={16} /></Button>
            )}
          </div>
        </form>
      </Popover.Content>
    </Popover.Root>
  );
};
