"use client";
import "@/app/prosemirror.css";
import { Container, Typography, Box } from "@mui/material";
import { SAVE_STATUS_VALUES } from "@/types";
import PublishCelebration from "@/components/PublishCelebration";
import { useArticleEditor } from "@/hooks/useArticleEditor";
import { ArticleFormFields } from "@/components/ArticleEditor/ArticleFormFields";
import { EditorSection } from "@/components/ArticleEditor/EditorSection";
import { ActionButtons } from "@/components/ArticleEditor/ActionButtons";

interface ArticlePageProps {
  articleId?: string;
}

export const ArticlePage = ({ articleId }: ArticlePageProps) => {
  const {
    // State
    titleEn,
    setTitleEn,
    titleAr,
    setTitleAr,
    author,
    setAuthor,
    keywordsEn,
    setKeywordsEn,
    keywordsAr,
    setKeywordsAr,
    contentEn,
    setContentEn,
    contentAr,
    setContentAr,
    descriptionEn,
    setDescriptionEn,
    descriptionAr,
    setDescriptionAr,
    setTextEn,
    setTextAr,
    coverImageUrl,
    setCoverImageUrl,
    loading,
    enEditorKey,
    arEditorKey,
    isPublished,
    saveStatus,
    lastSavedAt,
    isUploadingCover,
    showPublishModal,
    publishedUrl,
    publishedTitle,
    fileInputRef,
    // Actions
    handleFileButtonClick,
    handleFileChange,
    handleSaveOrUpdate,
    handleExportMarkdownEN,
    handleExportMarkdownAR,
    handleImportMarkdownEN,
    handleImportMarkdownAR,
    setShowPublishModal,
  } = useArticleEditor({ articleId });

  return (
    <Container id="new-article" aria-labelledby="new-article-header" maxWidth="md" sx={{ py: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography id="new-article-header" variant="h1" sx={{ textAlign: "center", mb: 2 }}>
        {articleId ? "Edit Article" : "New Article"}
      </Typography>

      {articleId && !isPublished && (
        <Box sx={{ mb: 2, p: 2, border: 1, borderColor: "warning.main", borderRadius: 1, bgcolor: "warning.light", width: "100%", maxWidth: "md" }}>
          <Typography variant="body2" sx={{ color: "warning.contrastText", fontWeight: "bold" }}>
            This article is a draft and has not been published yet.
          </Typography>
        </Box>
      )}

      <Typography variant="caption" sx={{ mb: 4, color: "text.secondary" }}>
        {saveStatus === SAVE_STATUS_VALUES.SAVING && "Saving..."}
        {saveStatus === SAVE_STATUS_VALUES.SAVED && `Saved ${lastSavedAt ? lastSavedAt.toLocaleTimeString() : ""}`}
        {saveStatus === SAVE_STATUS_VALUES.ERROR && "Save failed"}
        {saveStatus === SAVE_STATUS_VALUES.IDLE && lastSavedAt && `Last saved ${lastSavedAt.toLocaleTimeString()}`}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", p: 6, border: 1, maxWidth: "100%", width: "100%", gap: 6, borderRadius: 1, bgcolor: "background.paper", borderColor: "divider" }}>
        <ArticleFormFields
          titleEn={titleEn}
          setTitleEn={setTitleEn}
          titleAr={titleAr}
          setTitleAr={setTitleAr}
          author={author}
          setAuthor={setAuthor}
          keywordsEn={keywordsEn}
          setKeywordsEn={setKeywordsEn}
          keywordsAr={keywordsAr}
          setKeywordsAr={setKeywordsAr}
          descriptionEn={descriptionEn}
          setDescriptionEn={setDescriptionEn}
          descriptionAr={descriptionAr}
          setDescriptionAr={setDescriptionAr}
          coverImageUrl={coverImageUrl}
          setCoverImageUrl={setCoverImageUrl}
          isUploadingCover={isUploadingCover}
          handleFileButtonClick={handleFileButtonClick}
          handleFileChange={handleFileChange}
          fileInputRef={fileInputRef}
          articleId={articleId}
        />

        <EditorSection
          label="Content (English)"
          editorKey={enEditorKey}
          initialValue={contentEn}
          onChange={setContentEn}
          onTextChange={setTextEn}
          dir="ltr"
          onImportMarkdown={handleImportMarkdownEN}
          onExportMarkdown={handleExportMarkdownEN}
        />

        <EditorSection
          label="Content (Arabic)"
          editorKey={arEditorKey}
          initialValue={contentAr}
          onChange={setContentAr}
          onTextChange={setTextAr}
          dir="rtl"
          onImportMarkdown={handleImportMarkdownAR}
          onExportMarkdown={handleExportMarkdownAR}
        />

        {/* Publish celebration modal */}
        {showPublishModal && (
          <PublishCelebration
            open={showPublishModal}
            title={publishedTitle || titleEn}
            url={publishedUrl}
            onClose={() => {
              setShowPublishModal(false);
            }}
          />
        )}

        <ActionButtons
          loading={loading}
          isUploadingCover={isUploadingCover}
          articleId={articleId}
          onSaveDraft={() => handleSaveOrUpdate(false)}
          onPublish={() => handleSaveOrUpdate(true)}
        />
      </Box>
    </Container>
  );
};
