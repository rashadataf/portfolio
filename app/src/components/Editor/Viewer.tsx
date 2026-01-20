"use client";
import {
  EditorRoot,
  EditorContent,
  type JSONContent,
} from "novel";

import { defaultExtensions } from "@/components/Editor/extensions";

const extensions = [...defaultExtensions];

interface EditorProp {
  initialValue: JSONContent;
  dir: "ltr" | "rtl";
}
export const Viewer = ({ initialValue, dir = 'ltr' }: EditorProp) => {

  return (
    <EditorRoot>
      <EditorContent
        editable={false}
        editorContainerProps={{
          dir
        }}
        immediatelyRender={false}
        className="border-none"
        initialContent={initialValue}
        extensions={extensions}
        editorProps={{
          attributes: {
            class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default max-w-full`,
          },
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target as HTMLImageElement;
              if (target.tagName === 'IMG') {
                // Simple lightbox: open in new tab or modal
                window.open(target.src, '_blank');
              }
            },
          },
        }}
      >
      </EditorContent>
    </EditorRoot>
  );
};