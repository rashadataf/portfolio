import { useCallback } from "react";
import { useEditor } from "novel";
import * as Popover from "@radix-ui/react-popover";
import Button from '@mui/material/Button';
import { ChevronDown } from "lucide-react";
import { useSafeState } from "@/hooks/useSafeState.hook";

const FONT_OPTIONS = [
  { label: 'Small', value: '0.8rem' },
  { label: 'Normal', value: '1rem' },
  { label: 'Large', value: '1.25rem' },
  { label: 'XL', value: '1.5rem' },
];

export const FontSizeSelector = ({ onOpenChange }: { onOpenChange: (o: boolean) => void }) => {
  const { editor } = useEditor();
  const [open, setOpen] = useSafeState(false);

  const handleOpenChange = useCallback(
    (o: boolean) => {
      setOpen(o);
      onOpenChange(o);
    },
    [onOpenChange, setOpen]
  );

  if (!editor) return null;

  return (
    <Popover.Root modal={true} open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button size="small" onMouseDown={(e) => e.preventDefault()} variant="text" sx={{ minWidth: 'auto', p: '6px' }}>
          <span style={{ fontSize: '0.9rem' }}>A</span>
          <ChevronDown size={16} />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        sideOffset={5}
        align="start"
        className="popover-content"
      >
        {FONT_OPTIONS.map((opt) => (
          <div
            key={opt.value}
            onClick={() => {
              editor.chain().focus().setMark('fontSize', { fontSize: opt.value }).run();
              handleOpenChange(false);
            }}
            className="popover-item"
          >
            <span style={{ fontSize: opt.value }}>{opt.label}</span>
          </div>
        ))}
      </Popover.Content>
    </Popover.Root>
  );
};
