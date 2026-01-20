"use client";
import '@/app/prosemirror.css';
import { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';
import { JSONContent } from "novel";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { ArticleStatus, SaveStatus } from '@/types';
import { jsonToMarkdown, markdownToJson } from "@/lib/markdown";
import { CreateArticleDTO } from '@/modules/article/article.dto';
import { createArticle, getArticleById, updateArticle, uploadImage } from '@/modules/article/article.controller';
import { Loader } from '@/components//Loader';
import PublishCelebration from '@/components/PublishCelebration';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

interface ArticlePageProps {
    articleId?: string;
}

function prepareTextForTSVector(text: string) {
    return text
        .replace(/[^\w\s\u0600-\u06FF']/g, '') // Preserve Arabic and English alphanumeric characters, apostrophes, and spaces
        .replace(/[\u060C\u061B\u061F]/g, '') // Remove Arabic punctuation: ، ؛ ؟
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize multiple spaces to a single space
        .toLowerCase() // Convert to lowercase (affects only English text)
        .trim(); // Remove leading and trailing spaces
}

// Helper function to sanitize and produce slugs
const generateSlug = (slug: string) => {
    return slug
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9-\u0621-\u064A\u0660-\u0669 ]/g, "") // Remove invalid characters (keeps Arabic, numbers, and hyphens)
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

const Editor = dynamic(() =>
    import('@/components/Editor/Editor').then((mod) => mod.Editor),
    {
        ssr: false,
        loading: () => <Loader />,
    }
)

export const ArticlePage = ({ articleId }: ArticlePageProps) => {
    const router = useRouter();

    const [titleEn, setTitleEn] = useSafeState("");
    const [titleAr, setTitleAr] = useSafeState("");
    const [author, setAuthor] = useSafeState("");
    const [keywordsEn, setKeywordsEn] = useSafeState("");
    const [keywordsAr, setKeywordsAr] = useSafeState("");
    const [contentEn, setContentEn] = useSafeState<JSONContent | undefined>();
    const [contentAr, setContentAr] = useSafeState<JSONContent | undefined>();
    const [descriptionEn, setDescriptionEn] = useSafeState("");
    const [descriptionAr, setDescriptionAr] = useSafeState("");
    const [textEn, setTextEn] = useSafeState<string>('');
    const [textAr, setTextAr] = useSafeState<string>('');
    const [coverImage, setCoverImage] = useSafeState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useSafeState<string>('');
    const [loading, setLoading] = useSafeState(false);
    const [enEditorKey, setEnEditorKey] = useSafeState('en');
    const [arEditorKey, setArEditorKey] = useSafeState('ar');

    // Track if article is published and if user has modified it
    const [isPublished, setIsPublished] = useSafeState(false);
    const [hasModified, setHasModified] = useSafeState(false);

    // Store initial values for comparison
    const initialValuesRef = useRef({
        titleEn: '',
        titleAr: '',
        author: '',
        keywordsEn: '',
        keywordsAr: '',
        descriptionEn: '',
        descriptionAr: '',
        contentEn: undefined as JSONContent | undefined,
        contentAr: undefined as JSONContent | undefined,
        textEn: '',
        textAr: '',
        coverImageUrl: '',
    });

    // Autosave state
    const [currentArticleId, setCurrentArticleId] = useSafeState<string | null>(articleId || null);
    const [saveStatus, setSaveStatus] = useSafeState<SaveStatus>(SaveStatus.IDLE);
    const [lastSavedAt, setLastSavedAt] = useSafeState<Date | null>(null);
    const autosaveTimer = useRef<number | null>(null);

    useEffect(
        () => {
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
                        setCoverImageUrl(article.coverImage || '');
                        setDescriptionEn(article.descriptionEn || "");
                        setDescriptionAr(article.descriptionAr || "");
                        setEnEditorKey(`${articleId}_en`);
                        setArEditorKey(`${articleId}_ar`);
                        setIsPublished(article.status === ArticleStatus.PUBLISHED);
                        // Set initial values for comparison
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
                            textEn: '', // Will be set from content
                            textAr: '',
                            coverImageUrl: article.coverImage || '',
                        };
                    }
                } catch (error) {
                    console.error("Error fetching article:", error);
                }
            };

            fetchArticle();
        },
        [articleId, setAuthor, setContentAr, setContentEn, setCoverImageUrl, setKeywordsAr, setKeywordsEn, setTitleAr, setTitleEn, setDescriptionEn, setDescriptionAr, setEnEditorKey, setArEditorKey, setIsPublished]
    );

    const [isUploadingCover, setIsUploadingCover] = useSafeState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    interface UploadResponse { url?: string; status?: number; message?: string }

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                        // wait until the uploaded image can be loaded
                        await new Promise<void>((resolve, reject) => {
                            const img = new Image();
                            img.src = url as string;
                            img.onload = () => resolve();
                            img.onerror = () => reject(new Error('uploaded image failed to load'));
                        });
                        setCoverImageUrl(url);
                    } else {
                        console.error('Upload failed', res);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsUploadingCover(false);
                }
            })();
        }
    };

    const [showPublishModal, setShowPublishModal] = useSafeState(false);
    const [publishedUrl, setPublishedUrl] = useSafeState<string>('');
    const [publishedTitle, setPublishedTitle] = useSafeState<string>('');

    const handleSaveOrUpdate = async (publish: boolean) => {
        setLoading(true);
        try {
            const articlePayload: CreateArticleDTO = {
                titleEn: titleEn.trim() || "Untitled",
                titleAr: titleAr.trim() || "غير معنون",
                author,
                descriptionEn,
                descriptionAr,
                status: publish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
                keywordsEn: keywordsEn.split(",").map(kw => kw.trim()),
                keywordsAr: keywordsAr.split(",").map(kw => kw.trim()),
                contentEn: JSON.parse(JSON.stringify(contentEn)),
                contentAr: JSON.parse(JSON.stringify(contentAr)),
                contentSearchEn: prepareTextForTSVector(textEn),
                contentSearchAr: prepareTextForTSVector(textAr),
                slugEn: generateSlug(titleEn.trim() || "Untitled"),
                slugAr: generateSlug(titleAr.trim() || "غير معنون"),
                coverImage: coverImageUrl || undefined,
            };

            if (currentArticleId) {
                // Update existing article
                const res = await updateArticle(currentArticleId, articlePayload, coverImage);
                if (publish && res?.article) {
                    const slug = res.article.slugEn || generateSlug(titleEn);
                    const relativeUrl = `/articles/${slug}?lang=en`;
                    const origin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://www.rashadataf.com');
                    const absoluteUrl = new URL(relativeUrl, origin).toString();
                    setPublishedUrl(absoluteUrl);
                    setPublishedTitle(res.article.titleEn || titleEn);
                    setShowPublishModal(true);
                    setHasModified(false); // Reset modification flag after publishing
                } else if (!publish) {
                    router.push('/admin/articles');
                }
            } else {
                // Create new article and set id for future autosaves
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
                    setHasModified(false); // Reset modification flag after publishing
                } else if (!publish) {
                    router.push('/admin/articles');
                }
            }
        } catch (error) {
            console.error("Error saving/updating article:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper: produce absolute URL. Uses NEXT_PUBLIC_SITE_URL if provided, otherwise falls back to window.location.origin or a default domain.
    const makeAbsoluteUrl = (relativeUrl: string) => {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://www.rashadataf.com');
        return new URL(relativeUrl, origin).toString();
    };

    // Autosave: debounce changes and save as draft
    const saveDraft = async () => {
        // Ensure hasModified is set when saving starts
        setHasModified(true);

        try {
            setSaveStatus(SaveStatus.SAVING);
            const articlePayload: CreateArticleDTO = {
                titleEn: titleEn.trim() || "Untitled",
                titleAr: titleAr.trim() || "غير معنون",
                author,
                descriptionEn,
                descriptionAr,
                status: ArticleStatus.DRAFT,
                keywordsEn: keywordsEn.split(",").map(kw => kw.trim()),
                keywordsAr: keywordsAr.split(",").map(kw => kw.trim()),
                contentEn: contentEn ? JSON.parse(JSON.stringify(contentEn)) : ({ type: 'doc', content: [] } as unknown as JSONContent),
                contentAr: contentAr ? JSON.parse(JSON.stringify(contentAr)) : ({ type: 'doc', content: [] } as unknown as JSONContent),
                contentSearchEn: prepareTextForTSVector(textEn),
                contentSearchAr: prepareTextForTSVector(textAr),
                slugEn: generateSlug(titleEn.trim() || "Untitled"),
                slugAr: generateSlug(titleAr.trim() || "غير معنون"),
                // Don't include coverImage in auto-save to preserve existing
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

            setSaveStatus(SaveStatus.SAVED);
            setLastSavedAt(new Date());
            // Clear 'saved' state after a small delay
            setTimeout(() => {
                setSaveStatus(SaveStatus.IDLE);
            }, 3000);
        } catch (err) {
            console.error('Autosave failed:', err);
            setSaveStatus(SaveStatus.ERROR);
        }
    };

    const isMountedRef = useRef(false);

    // Track modifications for published articles
    useEffect(
        () => {
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
        },
        [titleEn, titleAr, author, keywordsEn, keywordsAr, descriptionEn, descriptionAr, contentEn, contentAr, textEn, textAr, coverImageUrl, isPublished, setHasModified]);

    useEffect(() => {
        // Skip autosave on first mount
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            return;
        }

        // For published articles, only autosave if user has made modifications
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titleEn, titleAr, author, keywordsEn, keywordsAr, descriptionEn, descriptionAr, contentEn, contentAr, textEn, textAr, coverImageUrl, isPublished, hasModified]);

    // Alert on leaving page if published article has been modified
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isPublished && hasModified) {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isPublished, hasModified]);

    const handleExportMarkdown = (content: JSONContent | undefined, lang: 'en' | 'ar') => {
        if (!content) return;
        const markdown = jsonToMarkdown(content).replace(/\/$/, '');
        // Create a more descriptive filename using the title
        const titleSlug = lang === 'en' ? (titleEn || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase() : (titleAr || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${titleSlug}_${lang}.md`;
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportMarkdownEN = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const markdown = event.target?.result as string;
                const json = markdownToJson(markdown);
                setContentEn(json);
                setEnEditorKey(`${Date.now()}_en`);
            };
            reader.onerror = () => {
                console.error('Error reading file');
            };
            reader.readAsText(file, 'UTF-8');
        };
        input.click();
    };

    const handleImportMarkdownAR = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const markdown = event.target?.result as string;
                const json = markdownToJson(markdown);
                setContentAr(json);
                setArEditorKey(`${Date.now()}_ar`);
            };
            reader.onerror = () => {
                console.error('Error reading file');
            };
            reader.readAsText(file, 'UTF-8');
        };
        input.click();
    };

    const handleExportMarkdownEN = (content: JSONContent) => {
        handleExportMarkdown(content, 'en');
    };

    const handleExportMarkdownAR = (content: JSONContent) => {
        handleExportMarkdown(content, 'ar');
    };

    return (
        <Container id="new-article" aria-labelledby="new-article-header" maxWidth="md" sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography id="new-article-header" variant="h1" sx={{ textAlign: 'center', mb: 2 }}>New Article</Typography>

            {articleId && !isPublished && (
                <Box sx={{ mb: 2, p: 2, border: 1, borderColor: 'warning.main', borderRadius: 1, bgcolor: 'warning.light', width: '100%', maxWidth: 'md' }}>
                    <Typography variant="body2" sx={{ color: 'warning.contrastText', fontWeight: 'bold' }}>
                        This article is a draft and has not been published yet.
                    </Typography>
                </Box>
            )}

            <Typography variant="caption" sx={{ mb: 4, color: 'text.secondary' }}>
                {saveStatus === SaveStatus.SAVING && 'Saving...'}
                {saveStatus === SaveStatus.SAVED && (`Saved ${lastSavedAt ? lastSavedAt.toLocaleTimeString() : ''}`)}
                {saveStatus === SaveStatus.ERROR && 'Save failed'}
                {saveStatus === SaveStatus.IDLE && lastSavedAt && (`Last saved ${lastSavedAt.toLocaleTimeString()}`)}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', p: 6, border: 1, maxWidth: '100%', width: '100%', gap: 6, borderRadius: 1, bgcolor: 'background.paper', borderColor: 'divider' }}>
                <TextField label="Title (English)" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} fullWidth required />
                <TextField label="العنوان (بالعربي)" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} fullWidth required slotProps={{ htmlInput: { dir: 'rtl' } }} />
                <TextField label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} fullWidth required />
                <TextField label="Keywords (English, comma-separated)" value={keywordsEn} onChange={(e) => setKeywordsEn(e.target.value)} fullWidth required />
                <TextField label="كلمات مفتاحية (بالعربي، مفصولة بالفاصلة)" value={keywordsAr} onChange={(e) => setKeywordsAr(e.target.value)} fullWidth required slotProps={{ htmlInput: { dir: 'rtl' } }} />
                <TextField label="Description (English)" value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} fullWidth required />
                <TextField label="الوصف (بالعربي)" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} fullWidth required slotProps={{ htmlInput: { dir: 'rtl' } }} />
                {
                    articleId ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {coverImageUrl && (
                                <Box>
                                    <NextImage src={coverImageUrl} alt="Cover Preview" width={300} height={300} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} unoptimized />
                                </Box>
                            )}
                            <Button variant="outlined" onClick={handleFileButtonClick} disabled={isUploadingCover}>
                                {isUploadingCover ? 'Uploading...' : 'Change Cover Image'}
                            </Button>
                            {coverImageUrl && (
                                <Button variant="outlined" color="error" onClick={() => { setCoverImageUrl(''); setCoverImage(null); }}>
                                    Remove Cover Image
                                </Button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body1">Cover Image</Typography>
                            <Button variant="outlined" onClick={handleFileButtonClick} disabled={isUploadingCover}>
                                {isUploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                            </Button>
                            {coverImageUrl && (
                                <Button variant="outlined" color="error" onClick={() => { setCoverImageUrl(''); setCoverImage(null); }}>
                                    Remove Cover Image
                                </Button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            {coverImageUrl && (
                                <Box>
                                    <NextImage src={coverImageUrl} alt="Cover Image" width={300} height={300} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} unoptimized />
                                </Box>
                            )}
                        </Box>
                    )
                }
                <Box sx={{ border: 1, borderRadius: 1, bgcolor: 'background.paper', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'semibold', borderBottom: 2, borderColor: 'divider', p: 4, bgcolor: 'background.default' }}>Content (English)</Typography>
                    <Editor key={'en'} editorKey={enEditorKey} initialValue={contentEn} onChange={setContentEn} onTextChange={setTextEn} dir='ltr' editable={true} onImportMarkdown={handleImportMarkdownEN} onExportMarkdown={handleExportMarkdownEN} />
                </Box>
                <Box sx={{ border: 1, borderRadius: 1, bgcolor: 'background.paper', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'semibold', borderBottom: 2, borderColor: 'divider', p: 4, bgcolor: 'background.default' }}>Content (Arabic)</Typography>
                    <Editor key={'ar'} editorKey={arEditorKey} initialValue={contentAr} onChange={setContentAr} onTextChange={setTextAr} dir='rtl' editable={true} onImportMarkdown={handleImportMarkdownAR} onExportMarkdown={handleExportMarkdownAR} />
                </Box>

                {/* Publish celebration modal */}
                {showPublishModal && (
                    // dynamic import would be fine, but small component so import statically
                    <PublishCelebration
                        open={showPublishModal}
                        title={publishedTitle || titleEn}
                        url={publishedUrl}
                        onClose={() => {
                            setShowPublishModal(false);
                            router.push('/admin/articles');
                        }}
                    />
                )}
                {
                    articleId && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                            <Button variant="outlined" disabled={loading || isUploadingCover} onClick={() => handleSaveOrUpdate(false)}>
                                {loading ? 'Updating...' : (isUploadingCover ? 'Uploading image...' : 'Save as Draft')}
                            </Button>
                            <Button variant="contained" disabled={loading || isUploadingCover} onClick={() => handleSaveOrUpdate(true)}>
                                {loading ? 'Updating...' : (isUploadingCover ? 'Uploading image...' : 'Publish')}
                            </Button>
                        </Box>
                    )
                }
                {
                    !articleId && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                            <Button variant="outlined" disabled={loading || isUploadingCover} onClick={() => handleSaveOrUpdate(false)}>
                                {loading ? 'Saving...' : (isUploadingCover ? 'Uploading image...' : 'Save as Draft')}
                            </Button>
                            <Button variant="contained" disabled={loading || isUploadingCover} onClick={() => handleSaveOrUpdate(true)}>
                                {loading ? 'Publishing...' : (isUploadingCover ? 'Uploading image...' : 'Publish')}
                            </Button>
                        </Box>
                    )
                }
            </Box>
        </Container>
    );
};
