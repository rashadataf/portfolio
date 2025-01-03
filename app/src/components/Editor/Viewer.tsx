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
            class: `prose prose-lg max-w-full`,
          },
        }}
      >
      </EditorContent>
    </EditorRoot>
  );
};