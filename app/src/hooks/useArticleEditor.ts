"use client";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { type JSONContent } from "novel";
import type { SaveStatus } from "@/types";
import { ARTICLE_STATUS_VALUES, SAVE_STATUS_VALUES } from "@/types";
import { jsonToMarkdown, markdownToJson } from "@/lib/markdown";
import { type CreateArticleDTO } from "@/modules/article/article.dto";
import { createArticle, getArticleById, updateArticle, uploadImage } from "@/modules/article/article.controller";
import { useSafeState } from "@/hooks/useSafeState.hook";

interface UseArticleEditorProps {
  articleId?: string;
}

interface UploadResponse {
  url?: string;
  status?: number;
  message?: string;
}

function prepareTextForTSVector(text: string) {
  return text
    .replace(/[^\w\s\u0600-\u06FF']/g, "")
    .replace(/[\u060C\u061B\u061F]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

const generateSlug = (slug: string) => {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-\u0621-\u064A\u0660-\u0669 ]/g, "")
    .replace(/\s+/g, "-");
};

const makeAbsoluteUrl = (relativeUrl: string) => {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://www.rashadataf.com");
  return new URL(relativeUrl, origin).toString();
};

export function useArticleEditor({ articleId }: UseArticleEditorProps) {
  const router = useRouter();
  const isMountedRef = useRef(false);
  const autosaveTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialValuesRef = useRef({
    titleEn: "",
    titleAr: "",
    author: "",
    keywordsEn: "",
    keywordsAr: "",
    descriptionEn: "",
    descriptionAr: "",
    contentEn: undefined as JSONContent | undefined,
    contentAr: undefined as JSONContent | undefined,
    textEn: "",
    textAr: "",
    coverImageUrl: "",
  });

  // State
  const [titleEn, setTitleEn] = useSafeState("");
  const [titleAr, setTitleAr] = useSafeState("");
  const [author, setAuthor] = useSafeState("");
  const [keywordsEn, setKeywordsEn] = useSafeState("");
  const [keywordsAr, setKeywordsAr] = useSafeState("");
  const [contentEn, setContentEn] = useSafeState<JSONContent | undefined>();
  const [contentAr, setContentAr] = useSafeState<JSONContent | undefined>();
  const [descriptionEn, setDescriptionEn] = useSafeState("");
  const [descriptionAr, setDescriptionAr] = useSafeState("");
  const [textEn, setTextEn] = useSafeState<string>("");
  const [textAr, setTextAr] = useSafeState<string>("");
  const [coverImage, setCoverImage] = useSafeState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useSafeState<string>("");
  const [loading, setLoading] = useSafeState(false);
  const [enEditorKey, setEnEditorKey] = useSafeState("en");
  const [arEditorKey, setArEditorKey] = useSafeState("ar");
  const [isPublished, setIsPublished] = useSafeState(false);
  const [hasModified, setHasModified] = useSafeState(false);
  const [currentArticleId, setCurrentArticleId] = useSafeState<string | null>(articleId || null);
  const [saveStatus, setSaveStatus] = useSafeState<SaveStatus>(SAVE_STATUS_VALUES.IDLE);
  const [lastSavedAt, setLastSavedAt] = useSafeState<Date | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useSafeState(false);
  const [showPublishModal, setShowPublishModal] = useSafeState(false);
  const [publishedUrl, setPublishedUrl] = useSafeState<string>("");
  const [publishedTitle, setPublishedTitle] = useSafeState<string>("");

  // Fetch article on mount
  useEffect(() => {
    if (!articleId) return;
    const fetchArticle = async () => {
      try {
        const response = await getArticleById(articleId);
        const article = response.article;

        if (article) {
          setTitleEn(article.titleEn || "");
          setTitleAr(article.titleAr || "");
          setAuthor(article.author || "");
          setKeywordsEn(article.keywordsEn?.join(", ") || "");
          setKeywordsAr(article.keywordsAr?.join(", ") || "");
          setContentEn(article.contentEn || null);
          setContentAr(article.contentAr || null);
          setCoverImageUrl(article.coverImage || "");
          setDescriptionEn(article.descriptionEn || "");
          setDescriptionAr(article.descriptionAr || "");
          setEnEditorKey(`${articleId}_en`);
          setArEditorKey(`${articleId}_ar`);
          setIsPublished(article.status === ARTICLE_STATUS_VALUES.PUBLISHED);
          initialValuesRef.current = {
            titleEn: article.titleEn || "",
            titleAr: article.titleAr || "",
            author: article.author || "",
            keywordsEn: article.keywordsEn?.join(", ") || "",
            keywordsAr: article.keywordsAr?.join(", ") || "",
            descriptionEn: article.descriptionEn || "",
            descriptionAr: article.descriptionAr || "",
            contentEn: article.contentEn || undefined,
            contentAr: article.contentAr || undefined,
            textEn: "",
            textAr: "",
            coverImageUrl: article.coverImage || "",
          };
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };

    fetchArticle();
  }, [
    articleId,
    setAuthor,
    setContentAr,
    setContentEn,
    setCoverImageUrl,
    setKeywordsAr,
    setKeywordsEn,
    setTitleAr,
    setTitleEn,
    setDescriptionEn,
    setDescriptionAr,
    setEnEditorKey,
    setArEditorKey,
    setIsPublished,
  ]);

  // Handle file upload
  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setCoverImage(file);
      if (file) {
        const localUrl = URL.createObjectURL(file);
        setCoverImageUrl(localUrl);
        setIsUploadingCover(true);

        (async () => {
          try {
            const res = (await uploadImage(file)) as UploadResponse;
            if (res && res.url) {
              const url = res.url;
              await new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("uploaded image failed to load"));
              });
              setCoverImageUrl(url);
            } else {
              console.error("Upload failed", res);
            }
          } catch (err) {
            console.error(err);
          } finally {
            setIsUploadingCover(false);
          }
        })();
      }
    },
    [setCoverImage, setCoverImageUrl, setIsUploadingCover]
  );

  // Save or update article
  const handleSaveOrUpdate = useCallback(
    async (publish: boolean) => {
      setLoading(true);
      try {
        const articlePayload: CreateArticleDTO = {
          titleEn: titleEn.trim() || "Untitled",
          titleAr: titleAr.trim() || "غير معنون",
          author,
          descriptionEn,
          descriptionAr,
          status: publish ? ARTICLE_STATUS_VALUES.PUBLISHED : ARTICLE_STATUS_VALUES.DRAFT,
          keywordsEn: keywordsEn.split(",").map((kw) => kw.trim()),
          keywordsAr: keywordsAr.split(",").map((kw) => kw.trim()),
          contentEn: JSON.parse(JSON.stringify(contentEn)),
          contentAr: JSON.parse(JSON.stringify(contentAr)),
          contentSearchEn: prepareTextForTSVector(textEn),
          contentSearchAr: prepareTextForTSVector(textAr),
          slugEn: generateSlug(titleEn.trim() || "Untitled"),
          slugAr: generateSlug(titleAr.trim() || "غير معنون"),
          coverImage: coverImageUrl || undefined,
        };

        if (currentArticleId) {
          const res = await updateArticle(currentArticleId, articlePayload, coverImage);
          if (publish && res?.article) {
            const slug = res.article.slugEn || generateSlug(titleEn);
            const relativeUrl = `/articles/${slug}?lang=en`;
            const absoluteUrl = makeAbsoluteUrl(relativeUrl);
            setPublishedUrl(absoluteUrl);
            setPublishedTitle(res.article.titleEn || titleEn);
            setShowPublishModal(true);
            setHasModified(false);
          } else if (!publish) {
            router.push("/admin/articles");
          }
        } else {
          const res = await createArticle(articlePayload, coverImage);
          if (res?.article?.id) {
            setCurrentArticleId(res.article.id);
            setEnEditorKey(`${res.article.id}_en`);
            setArEditorKey(`${res.article.id}_ar`);
          }
          if (publish && res?.article) {
            const slug = res.article.slugEn || generateSlug(titleEn);
            const relativeUrl = `/articles/${slug}?lang=en`;
            const absoluteUrl = makeAbsoluteUrl(relativeUrl);
            setPublishedUrl(absoluteUrl);
            setPublishedTitle(res.article.titleEn || titleEn);
            setShowPublishModal(true);
            setHasModified(false);
          } else if (!publish) {
            router.push("/admin/articles");
          }
        }
      } catch (error) {
        console.error("Error saving/updating article:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      titleEn,
      titleAr,
      author,
      descriptionEn,
      descriptionAr,
      keywordsEn,
      keywordsAr,
      contentEn,
      contentAr,
      textEn,
      textAr,
      coverImageUrl,
      coverImage,
      currentArticleId,
      router,
      setCurrentArticleId,
      setEnEditorKey,
      setArEditorKey,
      setPublishedUrl,
      setPublishedTitle,
      setShowPublishModal,
      setHasModified,
      setLoading,
    ]
  );

  // Autosave draft
  const saveDraft = useCallback(async () => {
    setHasModified(true);

    try {
      setSaveStatus(SAVE_STATUS_VALUES.SAVING);
      const articlePayload: CreateArticleDTO = {
        titleEn: titleEn.trim() || "Untitled",
        titleAr: titleAr.trim() || "غير معنون",
        author,
        descriptionEn,
        descriptionAr,
        status: ARTICLE_STATUS_VALUES.DRAFT,
        keywordsEn: keywordsEn.split(",").map((kw) => kw.trim()),
        keywordsAr: keywordsAr.split(",").map((kw) => kw.trim()),
        contentEn: contentEn
          ? JSON.parse(JSON.stringify(contentEn))
          : ({ type: "doc", content: [] } as unknown as JSONContent),
        contentAr: contentAr
          ? JSON.parse(JSON.stringify(contentAr))
          : ({ type: "doc", content: [] } as unknown as JSONContent),
        contentSearchEn: prepareTextForTSVector(textEn),
        contentSearchAr: prepareTextForTSVector(textAr),
        slugEn: generateSlug(titleEn.trim() || "Untitled"),
        slugAr: generateSlug(titleAr.trim() || "غير معنون"),
      };

      if (currentArticleId) {
        await updateArticle(currentArticleId, articlePayload, null);
      } else {
        const res = await createArticle(articlePayload, null);
        if (res?.article?.id) {
          setCurrentArticleId(res.article.id);
          setEnEditorKey(`${res.article.id}_en`);
          setArEditorKey(`${res.article.id}_ar`);
        }
      }

      setSaveStatus(SAVE_STATUS_VALUES.SAVED);
      setLastSavedAt(new Date());
      setTimeout(() => {
        setSaveStatus(SAVE_STATUS_VALUES.IDLE);
      }, 3000);
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus(SAVE_STATUS_VALUES.ERROR);
    }
  }, [
    titleEn,
    titleAr,
    author,
    descriptionEn,
    descriptionAr,
    keywordsEn,
    keywordsAr,
    contentEn,
    contentAr,
    textEn,
    textAr,
    currentArticleId,
    setCurrentArticleId,
    setEnEditorKey,
    setArEditorKey,
    setSaveStatus,
    setLastSavedAt,
    setHasModified,
  ]);

  // Track modifications for published articles
  useEffect(() => {
    if (!isMountedRef.current || !isPublished) return;
    const modified =
      titleEn !== initialValuesRef.current.titleEn ||
      titleAr !== initialValuesRef.current.titleAr ||
      author !== initialValuesRef.current.author ||
      keywordsEn !== initialValuesRef.current.keywordsEn ||
      keywordsAr !== initialValuesRef.current.keywordsAr ||
      descriptionEn !== initialValuesRef.current.descriptionEn ||
      descriptionAr !== initialValuesRef.current.descriptionAr ||
      JSON.stringify(contentEn) !== JSON.stringify(initialValuesRef.current.contentEn) ||
      JSON.stringify(contentAr) !== JSON.stringify(initialValuesRef.current.contentAr) ||
      textEn !== initialValuesRef.current.textEn ||
      textAr !== initialValuesRef.current.textAr ||
      coverImageUrl !== initialValuesRef.current.coverImageUrl;
    setHasModified(modified);
  }, [
    titleEn,
    titleAr,
    author,
    keywordsEn,
    keywordsAr,
    descriptionEn,
    descriptionAr,
    contentEn,
    contentAr,
    textEn,
    textAr,
    coverImageUrl,
    isPublished,
    setHasModified,
  ]);

  // Autosave effect
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (isPublished && !hasModified) {
      return;
    }

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = window.setTimeout(() => {
      saveDraft();
    }, 2500);

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [
    titleEn,
    titleAr,
    author,
    keywordsEn,
    keywordsAr,
    descriptionEn,
    descriptionAr,
    contentEn,
    contentAr,
    textEn,
    textAr,
    coverImageUrl,
    isPublished,
    hasModified,
    saveDraft,
  ]);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPublished && hasModified) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPublished, hasModified]);

  // Markdown import/export
  const handleExportMarkdown = useCallback(
    (content: JSONContent | undefined, lang: "en" | "ar") => {
      if (!content) return;
      const markdown = jsonToMarkdown(content).replace(/\/$/, "");
      const titleSlug =
        lang === "en"
          ? (titleEn || "untitled").replace(/[^a-z0-9]/gi, "_").toLowerCase()
          : (titleAr || "untitled").replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filename = `${titleSlug}_${lang}.md`;
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [titleEn, titleAr]
  );

  const handleImportMarkdown = useCallback(
    (lang: "en" | "ar") => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".md";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const markdown = event.target?.result as string;
          const json = markdownToJson(markdown);
          if (lang === "en") {
            setContentEn(json);
            setEnEditorKey(`${Date.now()}_en`);
          } else {
            setContentAr(json);
            setArEditorKey(`${Date.now()}_ar`);
          }
        };
        reader.onerror = () => {
          console.error("Error reading file");
        };
        reader.readAsText(file, "UTF-8");
      };
      input.click();
    },
    [setContentEn, setContentAr, setEnEditorKey, setArEditorKey]
  );

  const handleExportMarkdownEN = useCallback(
    (content: JSONContent) => handleExportMarkdown(content, "en"),
    [handleExportMarkdown]
  );

  const handleExportMarkdownAR = useCallback(
    (content: JSONContent) => handleExportMarkdown(content, "ar"),
    [handleExportMarkdown]
  );

  const handleImportMarkdownEN = useCallback(() => handleImportMarkdown("en"), [handleImportMarkdown]);
  const handleImportMarkdownAR = useCallback(() => handleImportMarkdown("ar"), [handleImportMarkdown]);

  return {
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
    textEn,
    setTextEn,
    textAr,
    setTextAr,
    coverImageUrl,
    setCoverImageUrl,
    loading,
    enEditorKey,
    arEditorKey,
    isPublished,
    hasModified,
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
    setLoading,
  };
}