import { JSONContent } from "novel";
import { Schema, DOMSerializer, NodeSpec, MarkSpec } from "prosemirror-model";
import TurndownService from "turndown";
import { defaultExtensions } from "@/components/Editor/extensions";

// Define types for ProseMirror JSON content
interface ProseMirrorMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface ProseMirrorNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ProseMirrorNode[];
  marks?: ProseMirrorMark[];
  text?: string;
}

// Create schema from default extensions
const nodes: Record<string, NodeSpec> = {};
const marks: Record<string, MarkSpec> = {};

defaultExtensions.forEach(ext => {
  if (ext.type === 'node') {
    nodes[ext.name] = ext;
  } else if (ext.type === 'mark') {
    marks[ext.name] = ext;
  }
});

// Ensure required nodes are present
if (!nodes.doc) {
  nodes.doc = {
    content: 'block+',
  };
}

if (!nodes.text) {
  nodes.text = {
    group: 'inline',
  };
}

if (!nodes.paragraph) {
  nodes.paragraph = {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
  };
}

if (!nodes.codeBlock) {
  nodes.codeBlock = {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM: () => ['pre', ['code', 0]],
  };
}

const schema = new Schema({ nodes, marks });

// HTML serializer
const serializer = DOMSerializer.fromSchema(schema);

// Turndown for HTML to Markdown
const turndownService = new TurndownService();

// Function to convert JSONContent to Markdown
export function jsonToMarkdown(json: JSONContent): string {
  const doc = schema.nodeFromJSON(json);
  const dom = serializer.serializeFragment(doc.content);
  const html = document.createElement('div');
  html.appendChild(dom);
  return turndownService.turndown(html.innerHTML);
}

// Function to convert Markdown to JSONContent
export function markdownToJson(markdown: string): JSONContent {
  const lines = markdown.split('\n');
  const content: ProseMirrorNode[] = [];
  let currentParagraph: ProseMirrorNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockLang = '';
  let currentOrderedList: ProseMirrorNode[] = [];
  let currentBulletList: ProseMirrorNode[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      content.push({
        type: 'paragraph',
        content: currentParagraph
      });
      currentParagraph = [];
    }
  };

  const flushOrderedList = () => {
    if (currentOrderedList.length > 0) {
      content.push({
        type: 'orderedList',
        content: currentOrderedList
      });
      currentOrderedList = [];
    }
  };

  const flushBulletList = () => {
    if (currentBulletList.length > 0) {
      content.push({
        type: 'bulletList',
        content: currentBulletList
      });
      currentBulletList = [];
    }
  };

  const parseInline = (text: string): ProseMirrorNode[] => {
    // Simple inline parsing for bold, italic, code, and links
    const parts: ProseMirrorNode[] = [];
    // Updated regex to handle links: [text](url)
    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[([^\]]+)\]\(([^)]+)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: text.slice(lastIndex, match.index) });
      }
      if (match[2]) { // **bold**
        parts.push({ type: 'text', marks: [{ type: 'bold' }], text: match[2] });
      } else if (match[3]) { // *italic*
        parts.push({ type: 'text', marks: [{ type: 'italic' }], text: match[3] });
      } else if (match[4]) { // `code`
        parts.push({ type: 'text', marks: [{ type: 'code' }], text: match[4] });
      } else if (match[5] && match[6]) { // [text](url) - link
        parts.push({
          type: 'text',
          marks: [{ type: 'link', attrs: { href: match[6] } }],
          text: match[5]
        });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', text: text.slice(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: 'text', text }];
  };

  for (const line of lines) {
    if (inCodeBlock) {
      if (line.trim() === '```') {
        flushParagraph();
        content.push({
          type: 'codeBlock',
          attrs: { language: codeBlockLang },
          content: [{ type: 'text', text: codeBlockContent.trim() }]
        });
        inCodeBlock = false;
        codeBlockContent = '';
        codeBlockLang = '';
      } else {
        codeBlockContent += line + '\n';
      }
      continue;
    }

    const trimmed = line.trim();
    if (trimmed === '') {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushParagraph();
      inCodeBlock = true;
      codeBlockLang = trimmed.slice(3).trim();
      continue;
    }

    if (trimmed.startsWith('#')) {
      flushParagraph();
      flushOrderedList();
      flushBulletList();
      const level = trimmed.match(/^#+/)![0].length;
      const text = trimmed.replace(/^#+\s*/, '');
      content.push({
        type: 'heading',
        attrs: { level },
        content: parseInline(text)
      });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      flushOrderedList(); // Flush any pending ordered list
      const text = trimmed.slice(2);
      currentBulletList.push({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: parseInline(text)
        }]
      });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      flushBulletList(); // Flush any pending bullet list
      const text = trimmed.replace(/^\d+\.\s*/, '');
      currentOrderedList.push({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: parseInline(text)
        }]
      });
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushOrderedList();
      flushBulletList();
      const text = trimmed.slice(2);
      content.push({
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: parseInline(text)
        }]
      });
      continue;
    }

    // Check for images: ![alt](url)
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushOrderedList();
      flushBulletList();
      content.push({
        type: 'paragraph',
        content: [{
          type: 'image',
          attrs: { src: imageMatch[2], alt: imageMatch[1] || '' }
        }]
      });
      continue;
    }

    // Default to paragraph
    flushOrderedList();
    flushBulletList();
    currentParagraph.push(...parseInline(line));
  }

  flushParagraph();
  flushOrderedList();
  flushBulletList();

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  };
}