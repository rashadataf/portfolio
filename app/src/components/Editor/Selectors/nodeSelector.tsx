import React from 'react';
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
  Check,
  type LucideIcon,
} from "lucide-react";
import { EditorInstance, useEditor } from "novel";
import * as Popover from "@radix-ui/react-popover";
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

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();

  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? { name: "Multiple" };

  return (
    <Popover.Root modal={true} open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <Button
          size="small"
          variant="text"
          sx={{ minWidth: 'auto', p: '6px' }}
        >
          <span style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{activeItem.name}</span>
          <ChevronDown size={16} />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        sideOffset={5}
        align="start"
        className="popover-content"
      >
        {items.map((item) => (
          <div
            key={item.name}
            onClick={() => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="popover-item"
          >
            <div className="flex items-center space-x-2">
              <div className="popover-item-icon">
                <item.icon size={12} />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check size={16} />}
          </div>
        ))}
      </Popover.Content>
    </Popover.Root>
  );
};
