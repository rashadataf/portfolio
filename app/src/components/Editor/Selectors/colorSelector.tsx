import React from 'react';
import { Check, ChevronDown } from "lucide-react";
import { useEditor } from "novel";
import * as Popover from "@radix-ui/react-popover";
import Button from '@mui/material/Button';

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

export const ColorSelector = ({ open, onOpenChange }: ColorSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;

  const activeColorItem = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color }),
  );

  const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color }),
  );

  return (
    <Popover.Root modal={true} open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <Button size="small" onMouseDown={(e) => e.preventDefault()} variant="text" sx={{ minWidth: 'auto', p: '6px' }}>
          <span
            style={{
              color: activeColorItem?.color,
              backgroundColor: activeHighlightItem?.color,
              borderRadius: '2px',
              padding: '0 4px',
            }}
          >
            A
          </span>
          <ChevronDown size={16} />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        sideOffset={5}
        align="start"
        className="popover-content"
      >
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 8px' }}>Color</div>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <div
              key={index}
              onClick={() => {
                editor.commands.unsetColor();
                if (name !== "Default") {
                  editor.chain().focus().setColor(color || "").run();
                }
                onOpenChange(false);
              }}
              className="popover-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ borderRadius: '2px', padding: '2px 4px', fontWeight: 600, color }}>A</span>
                <span>{name}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0 8px' }}>Background</div>
          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <div
              key={index}
              onClick={() => {
                editor.commands.unsetHighlight();
                if (name !== "Default") {
                  editor.chain().focus().setHighlight({ color }).run();
                }
                onOpenChange(false);
              }}
              className="popover-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ borderRadius: '2px', padding: '2px 4px', fontWeight: 600, backgroundColor: color }}>A</span>
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", { color }) && (
                <Check size={16} />
              )}
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
