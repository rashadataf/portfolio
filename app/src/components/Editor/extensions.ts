import {
  TiptapImage,
  TiptapLink,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  AIHighlight,
} from "novel/extensions";
import { UploadImagesPlugin } from "novel/plugins";

import { cx } from "class-variance-authority";

const aiHighlight = AIHighlight;
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx("tiptap-link"),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("tiptap-image-loading"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("tiptap-image"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("task-list"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("task-item"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("horizontal-rule"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("bullet-list"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("ordered-list"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("list-item"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("blockquote-custom"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("code-block"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("inline-code"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

import { Mark } from '@tiptap/core';
import type { RawCommands } from '@tiptap/core';

/**
 * fontSize mark: unique name 'fontSize' (no duplicate with textStyle)
 * Stores inline font-size via style attribute and exposes a setFontSize command
 */
const fontSize = Mark.create({
  name: 'fontSize',
  addOptions() {
    return { HTMLAttributes: {} };
  },
  addAttributes() {
    return {
      fontSize: { default: null },
    };
  },
  parseHTML() {
    return [{ style: 'font-size' }];
  },
  renderHTML({ HTMLAttributes }) {
    if (!HTMLAttributes.fontSize) return ['span', 0];
    return ['span', { style: `font-size: ${HTMLAttributes.fontSize}` }, 0];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string | null) =>
        ({ commands }: { commands: RawCommands }) => {
          if (!fontSize) {
            return commands.unsetMark('fontSize');
          }
          return commands.setMark('fontSize', { fontSize });
        },
    } as Partial<RawCommands>;
  },
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  // updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  fontSize,
  aiHighlight,
];
