"use client";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

interface ActionButtonsProps {
  loading: boolean;
  isUploadingCover: boolean;
  articleId?: string;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function ActionButtons({
  loading,
  isUploadingCover,
  articleId,
  onSaveDraft,
  onPublish,
}: ActionButtonsProps) {
  const isDisabled = loading || isUploadingCover;
  const savingText = loading ? (articleId ? "Updating..." : "Saving...") : isUploadingCover ? "Uploading image..." : articleId ? "Save as Draft" : "Save as Draft";
  const publishingText = loading ? (articleId ? "Updating..." : "Publishing...") : isUploadingCover ? "Uploading image..." : articleId ? "Publish" : "Publish";

  return (
    <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
      <Button variant="outlined" disabled={isDisabled} onClick={onSaveDraft}>
        {savingText}
      </Button>
      <Button variant="contained" disabled={isDisabled} onClick={onPublish}>
        {publishingText}
      </Button>
    </Box>
  );
}