"use client";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  type JSONContent,
  EditorCommandList,
  EditorBubble,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { handleImageDrop, handleImagePaste } from "novel/plugins";

import { defaultExtensions } from "@/components/Editor/extensions";
import { NodeSelector } from "@/components/Editor/Selectors/nodeSelector";
import { LinkSelector } from "@/components/Editor/Selectors/linkSelector";
import { ColorSelector } from "@/components/Editor/Selectors/colorSelector";
import { TextButtons } from "@/components/Editor/Selectors/textButtons";
import { FontSizeSelector } from "@/components/Editor/Selectors/fontSizeSelector";
import { createSlashCommand } from "@/components/Editor/slashCommand";
import { uploadFn } from "@/components/Editor/imageUpload";
import { Separator } from "@/components/UI/Separator";
import { useSafeState } from "@/hooks/useSafeState.hook";
import Paper from '@mui/material/Paper';

interface EditorProp {
  initialValue: JSONContent | undefined;
  onChange: (value: JSONContent) => void;
  onTextChange: (plainText: string) => void;
  dir: "ltr" | "rtl";
  editable: boolean;
  editorKey: string;
  onImportMarkdown?: () => void;
  onExportMarkdown?: (content: JSONContent) => void;
}
export const Editor = ({ initialValue, onChange, onTextChange, dir = "ltr", editable, editorKey, onImportMarkdown, onExportMarkdown }: EditorProp) => {
  const [openNode, setOpenNode] = useSafeState(false);
  const [openColor, setOpenColor] = useSafeState(false);
  const [openLink, setOpenLink] = useSafeState(false);

  const { slashCommand, suggestionItems } = createSlashCommand(onImportMarkdown, onExportMarkdown);

  const extensions = [...defaultExtensions, slashCommand];

  return (
    <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.paper' }}>
      <EditorRoot key={editorKey}>
        <EditorContent
          editable={editable}
          editorContainerProps={{
            dir,
          }}
          immediatelyRender={true}
          className="border p-4 rounded-xl"
          initialContent={initialValue}
          extensions={extensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
          }}
          onUpdate={({ editor }) => {
            onTextChange(editor.getText());
            onChange(editor.getJSON());
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="slash-command-popup">
            <EditorCommandEmpty className="slash-command-empty">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="slash-command-item"
                  key={item.title}
                >
                  <div className="slash-command-item-icon">
                    {item.icon}
                  </div>
                  <div className="slash-command-item-content">
                    <p className="slash-command-item-title">{item.title}</p>
                    <p className="slash-command-item-description">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorBubble
            tippyOptions={{
              placement: "top",
              appendTo: (typeof document !== 'undefined' ? document.body : undefined),
              popperOptions: { strategy: 'fixed' },
            }}
            className="editor-bubble flex w-fit max-w-[90vw] rounded-md border border-muted bg-background shadow-xl"
            >
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <FontSizeSelector onOpenChange={() => {}} />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </Paper>
  );
};