import { JSONContent } from "novel";
import { Schema, DOMSerializer, NodeSpec, MarkSpec } from "prosemirror-model";
import TurndownService from "turndown";

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

// Create a standard ProseMirror schema with common nodes and marks
const nodes: Record<string, NodeSpec> = {
  doc: {
    content: 'block+',
  },
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
  },
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM: (node: { attrs?: { level?: number } }) => [`h${node.attrs!.level}`, 0],
  },
  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => ['blockquote', 0],
  },
  bulletList: {
    content: 'listItem+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM: () => ['ul', 0],
  },
  orderedList: {
    attrs: { start: { default: 1 } },
    content: 'listItem+',
    group: 'block',
    parseDOM: [{ tag: 'ol', getAttrs: (dom: Element) => ({ start: ((dom as HTMLOListElement).start) || 1 }) }],
    toDOM: (node: { attrs?: { start?: number } }) => (node.attrs && node.attrs.start === 1 ? ['ol', 0] : ['ol', { start: node.attrs?.start }, 0]),
  },
  listItem: {
    content: 'paragraph block*',
    defining: true,
    parseDOM: [{ tag: 'li' }],
    toDOM: () => ['li', 0],
  },
  codeBlock: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    attrs: { language: { default: '' } },
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM: (node: { attrs?: { language?: string } }) => {
      const language = node.attrs?.language;
      if (language) {
        return ['pre', ['code', { class: `language-${language}` }, 0]];
      }
      return ['pre', ['code', 0]];
    },
  },
  text: {
    group: 'inline',
  },
  image: {
    inline: true,
    attrs: {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    },
    group: 'inline',
    draggable: true,
    parseDOM: [{
      tag: 'img[src]',
      getAttrs: (dom: Element) => ({
        src: (dom as HTMLImageElement).getAttribute('src'),
        alt: (dom as HTMLImageElement).getAttribute('alt'),
        title: (dom as HTMLImageElement).getAttribute('title'),
      }),
    }],
    toDOM: (node: { attrs?: Record<string, unknown> }) => ['img', node.attrs],
  },
};

const marks: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (node: HTMLElement) => node.style.fontWeight !== 'normal' && null },
    ],
    toDOM: () => ['strong', 0],
  },
  italic: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style=italic' },
    ],
    toDOM: () => ['em', 0],
  },
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM: () => ['code', 0],
  },
  link: {
    attrs: {
      href: {},
      title: { default: null },
    },
    inclusive: false,
    parseDOM: [{
      tag: 'a[href]',
      getAttrs: (dom: Element) => ({
        href: (dom as HTMLAnchorElement).getAttribute('href'),
        title: (dom as HTMLAnchorElement).getAttribute('title'),
      }),
    }],
    toDOM: (node: { attrs?: Record<string, unknown> }) => ['a', node.attrs, 0],
  },
};

const schema = new Schema({ nodes, marks });

// HTML serializer
const serializer = DOMSerializer.fromSchema(schema);

// Turndown for HTML to Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  strongDelimiter: '**',
  emDelimiter: '*'
});

// Add rule to preserve nested list indentation
export let lastListItemLog = '';
export let lastImportLog = '';

turndownService.addRule('listItem', {
  filter: 'li',
  replacement: function (content: string, node: Element, options: { bulletListMarker?: string }) {
    // Keep a single leading newline (so nested lists remain on their own lines) and normalize trailing newlines
    content = content.replace(/^\n+/, '\n').replace(/\n+$/, '\n');

    // Calculate indentation based on nesting level (case-insensitive checks)
    let depth = 0;
    let parent = node.parentNode;
    while (parent && (parent.nodeName || '').toLowerCase() !== 'body' && (parent.nodeName || '').toLowerCase() !== '#document-fragment') {
      const name = (parent.nodeName || '').toLowerCase();
      if (name === 'ul' || name === 'ol') {
        depth++;
      }
      parent = parent.parentNode;
    }
    const indent = '  '.repeat(Math.max(0, depth - 1)); // 2 spaces per nesting level (minus one for the marker)

    // Indent all subsequent lines so nested blocks (lists, code blocks) are indented correctly
    if (content.indexOf('\n') !== -1) {
      const lines = content.split('\n');
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].length > 0) {
          lines[i] = indent + lines[i];
        }
      }
      content = lines.join('\n');
    }

    let prefix = options.bulletListMarker + ' ';
    const parentList = node.parentNode;
    let index = -1;
    let startAttr: string | null = null;
    if (parentList && ((parentList.nodeName || '').toLowerCase() === 'ol')) {
      startAttr = (parentList as Element).getAttribute('start');
      index = Array.from(parentList.children).indexOf(node as Element);
      prefix = (startAttr ? parseInt(startAttr) + index : index + 1) + '. ';
    } else if (parentList) {
      index = Array.from(parentList.children).indexOf(node as Element);
    }

    // Structured single log message for debugging
    try {
      const preview = content.length > 200 ? content.slice(0, 200) + '…' : content;
      const parentTags: string[] = [];
      let p = node.parentNode;
      let depthCount = 0;
      while (p && depthCount < 20) {
        parentTags.push((p.nodeName || '').toLowerCase());
        p = p.parentNode;
        depthCount++;
      }
      const logObj = {
        preview: preview.replace(/\n/g, '\\n'),
        depth,
        indent,
        parentTags,
        parentListNode: parentList ? (parentList.nodeName || '').toLowerCase() : null,
        index,
        startAttr,
        prefix
      };
      lastListItemLog = 'LIST_ITEM_LOG: ' + JSON.stringify(logObj);

      // Expose to global and print once to console so you can copy-paste it from the browser console
      try {
        (globalThis as unknown as Record<string, unknown>).lastListItemLog = lastListItemLog;
        if (typeof console !== 'undefined' && console.info) console.info(lastListItemLog);
      } catch {
        // ignore failures to attach to global or log
      }
    } catch (e) {
      lastListItemLog = 'LIST_ITEM_LOG_ERROR: ' + String(e);
      try {
        (globalThis as unknown as Record<string, unknown>).lastListItemLog = lastListItemLog;
        if (typeof console !== 'undefined' && console.error) console.error(lastListItemLog);
      } catch { }
    }

    return indent + prefix + content;
  }
});

// Preserve code block language
turndownService.addRule('codeBlock', {
  filter: 'pre',
  replacement: function (content: string, node: Element) {
    // Try to detect language from class or data attributes
    const codeElement = node.querySelector('code');
    let language = '';

    if (codeElement) {
      // Check for language class
      const className = codeElement.className || '';
      const langMatch = className.match(/language-(\w+)/);
      if (langMatch) {
        language = langMatch[1];
      }

      // Use text content
      content = codeElement.textContent || content;
    }

    // Clean up content
    content = content.replace(/^\n+/, '').replace(/\n+$/, '');

    if (language) {
      return '\n\n```' + language + '\n' + content + '\n```\n\n';
    } else {
      return '\n\n```\n' + content + '\n```\n\n';
    }
  }
});

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

  // List parsing state
  const listStack: Array<{
    type: 'bulletList' | 'orderedList';
    level: number;
    items: ProseMirrorNode[];
    start?: number;
  }> = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      content.push({
        type: 'paragraph',
        content: currentParagraph
      });
      currentParagraph = [];
    }
  };

  const flushLists = () => {
    // Close all open lists
    while (listStack.length > 0) {
      const list = listStack.pop()!;
      const listNode = {
        type: list.type,
        ...(list.type === 'orderedList' && list.start ? { attrs: { start: list.start } } : {}),
        content: list.items
      };

      if (listStack.length > 0) {
        // Add nested list to the last item of the parent list
        const parentList = listStack[listStack.length - 1];
        const lastItem = parentList.items[parentList.items.length - 1];
        if (lastItem && lastItem.content) {
          lastItem.content.push(listNode);
        }
      } else {
        // Add to main content
        content.push(listNode);
      }
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

  const getIndentLevel = (line: string): number => {
    const match = line.match(/^([ \t]*)/);
    if (!match) return 0;
    const leading = match[1];
    let spaces = 0;
    for (const char of leading) {
      spaces += char === '\t' ? 4 : 1;
    }
    return spaces > 0 ? 1 : 0;
  }

  const parseListItem = (line: string, _indent: number): { type: 'bullet' | 'ordered'; text: string; start?: number } | null => {
    void _indent;
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return { type: 'bullet', text: trimmed.slice(2) };
    }
    const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
    if (orderedMatch) {
      return { type: 'ordered', text: orderedMatch[2], start: parseInt(orderedMatch[1]) };
    }
    return null;
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
      flushLists();
      const level = trimmed.match(/^#+/)![0].length;
      const text = trimmed.replace(/^#+\s*/, '');
      content.push({
        type: 'heading',
        attrs: { level },
        content: parseInline(text)
      });
      continue;
    }

    // Check for list items
    const level = getIndentLevel(line);
    const listItem = parseListItem(line, level);

    if (listItem) {
      flushParagraph();

      // Structured single log message for import debugging
      try {
        const previewLine = line.length > 200 ? line.slice(0, 200) + '…' : line;
        const top = listStack.length > 0 ? listStack[listStack.length - 1] : null;
        const logObj = {
          line: previewLine.replace(/\n/g, '\\n'),
          level,
          listItemType: listItem.type,
          listItemText: (listItem.text || '').slice(0, 200),
          listItemStart: listItem.start !== undefined ? listItem.start : null,
          stackLength: listStack.length,
          topList: top ? { type: top.type, level: top.level, start: top.start || null } : null
        };
        lastImportLog = 'IMPORT_LIST_ITEM_LOG: ' + JSON.stringify(logObj);
        try {
          (globalThis as unknown as Record<string, unknown>).lastImportLog = lastImportLog;
          if (typeof console !== 'undefined' && console.info) console.info(lastImportLog);
        } catch { }
      } catch (e) {
        lastImportLog = 'IMPORT_LIST_ITEM_LOG_ERROR: ' + String(e);
        try { (globalThis as unknown as Record<string, unknown>).lastImportLog = lastImportLog; if (typeof console !== 'undefined' && console.error) console.error(lastImportLog); } catch { }
      }

      // Close lists that are at deeper indentation levels
      while (listStack.length > 0 && listStack[listStack.length - 1].level > level) {
        const list = listStack.pop()!;
        const listNode = {
          type: list.type,
          ...(list.type === 'orderedList' && list.start ? { attrs: { start: list.start } } : {}),
          content: list.items
        };

        if (listStack.length > 0) {
          // Add nested list to the last item of the parent list
          const parentList = listStack[listStack.length - 1];
          const lastItem = parentList.items[parentList.items.length - 1];
          if (lastItem && lastItem.content) {
            lastItem.content.push(listNode);
          }
        } else {
          // Add to main content
          content.push(listNode);
        }
      }

      // Start new list or add to existing one
      const listType = listItem.type === 'bullet' ? 'bulletList' : 'orderedList';
      const listStart = listItem.type === 'ordered' ? listItem.start : undefined;

      if (listStack.length === 0 || listStack[listStack.length - 1].level !== level ||
        listStack[listStack.length - 1].type !== listType) {
        listStack.push({
          type: listType,
          level,
          items: [],
          start: listStart
        });
      }

      // Add list item
      listStack[listStack.length - 1].items.push({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: parseInline(listItem.text)
        }]
      });

      continue;
    }

    // Close any open lists if we're not in a list
    if (listStack.length > 0) {
      flushLists();
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
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
    currentParagraph.push(...parseInline(line));
  }

  flushParagraph();
  flushLists();

  console.log('Parsed JSONContent:', JSON.stringify({ type: 'doc', content }, null, 2));

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  };
}