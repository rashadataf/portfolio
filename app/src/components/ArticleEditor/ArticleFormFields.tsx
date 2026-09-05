"use client";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import NextImage from "next/image";
import Typography from "@mui/material/Typography";

interface ArticleFormFieldsProps {
  titleEn: string;
  setTitleEn: (value: string) => void;
  titleAr: string;
  setTitleAr: (value: string) => void;
  author: string;
  setAuthor: (value: string) => void;
  keywordsEn: string;
  setKeywordsEn: (value: string) => void;
  keywordsAr: string;
  setKeywordsAr: (value: string) => void;
  descriptionEn: string;
  setDescriptionEn: (value: string) => void;
  descriptionAr: string;
  setDescriptionAr: (value: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (value: string) => void;
  isUploadingCover: boolean;
  handleFileButtonClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  articleId?: string;
}

export function ArticleFormFields({
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
  descriptionEn,
  setDescriptionEn,
  descriptionAr,
  setDescriptionAr,
  coverImageUrl,
  setCoverImageUrl,
  isUploadingCover,
  handleFileButtonClick,
  handleFileChange,
  fileInputRef,
  articleId,
}: ArticleFormFieldsProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <TextField
        label="Title (English)"
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="العنوان (بالعربي)"
        value={titleAr}
        onChange={(e) => setTitleAr(e.target.value)}
        fullWidth
        required
        slotProps={{ htmlInput: { dir: "rtl" } }}
      />
      <TextField
        label="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Keywords (English, comma-separated)"
        value={keywordsEn}
        onChange={(e) => setKeywordsEn(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="كلمات مفتاحية (بالعربي، مفصولة بالفاصلة)"
        value={keywordsAr}
        onChange={(e) => setKeywordsAr(e.target.value)}
        fullWidth
        required
        slotProps={{ htmlInput: { dir: "rtl" } }}
      />
      <TextField
        label="Description (English)"
        value={descriptionEn}
        onChange={(e) => setDescriptionEn(e.target.value)}
        fullWidth
        required
      />
      <TextField
        label="الوصف (بالعربي)"
        value={descriptionAr}
        onChange={(e) => setDescriptionAr(e.target.value)}
        fullWidth
        required
        slotProps={{ htmlInput: { dir: "rtl" } }}
      />
      {articleId ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {coverImageUrl && (
            <Box>
              <NextImage
                src={coverImageUrl}
                alt="Cover Preview"
                width={300}
                height={300}
                style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }}
                unoptimized
              />
            </Box>
          )}
          <Button variant="outlined" onClick={handleFileButtonClick} disabled={isUploadingCover}>
            {isUploadingCover ? "Uploading..." : "Change Cover Image"}
          </Button>
          {coverImageUrl && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setCoverImageUrl("");
              }}
            >
              Remove Cover Image
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">Cover Image</Typography>
          <Button variant="outlined" onClick={handleFileButtonClick} disabled={isUploadingCover}>
            {isUploadingCover ? "Uploading..." : "Upload Cover Image"}
          </Button>
          {coverImageUrl && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setCoverImageUrl("");
              }}
            >
              Remove Cover Image
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          {coverImageUrl && (
            <Box>
              <NextImage
                src={coverImageUrl}
                alt="Cover Image"
                width={300}
                height={300}
                style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }}
                unoptimized
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}