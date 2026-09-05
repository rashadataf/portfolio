"use client";
import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";
import { type JSONContent } from "novel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Editor = dynamic(
  () => import("@/components/Editor/Editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <Loader />,
  }
);

interface EditorSectionProps {
  label: string;
  editorKey: string;
  initialValue: JSONContent | undefined;
  onChange: (value: JSONContent) => void;
  onTextChange: (plainText: string) => void;
  dir: "ltr" | "rtl";
  onImportMarkdown: () => void;
  onExportMarkdown: (content: JSONContent) => void;
}

export function EditorSection({
  label,
  editorKey,
  initialValue,
  onChange,
  onTextChange,
  dir,
  onImportMarkdown,
  onExportMarkdown,
}: EditorSectionProps) {
  return (
    <Box sx={{ border: 1, borderRadius: 1, bgcolor: "background.paper", borderColor: "divider" }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: "semibold",
          borderBottom: 2,
          borderColor: "divider",
          p: 4,
          bgcolor: "background.default",
        }}
      >
        {label}
      </Typography>
      <Editor
        key={editorKey}
        editorKey={editorKey}
        initialValue={initialValue}
        onChange={onChange}
        onTextChange={onTextChange}
        dir={dir}
        editable={true}
        onImportMarkdown={onImportMarkdown}
        onExportMarkdown={onExportMarkdown}
      />
    </Box>
  );
}