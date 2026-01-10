"use client";
import '@/app/prosemirror.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';
import { JSONContent } from "novel";
import { Section } from "@/components/Section";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { ArticleStatus } from '@/types';
import { createArticle, getArticleById, updateArticle, uploadImage } from '@/modules/article/article.controller';
import { CreateArticleDTO } from '@/modules/article/article.dto';
import { Loader } from '@/components//Loader';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

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
                        setCoverImageUrl(article.coverImage);
                        setDescriptionEn(article.descriptionEn || "");
                        setDescriptionAr(article.descriptionAr || "");
                        setEnEditorKey(`${articleId}_en`);
                        setArEditorKey(`${articleId}_ar`);
                    }
                } catch (error) {
                    console.error("Error fetching article:", error);
                }
            };

            fetchArticle();
        },
        [articleId, setAuthor, setContentAr, setContentEn, setCoverImageUrl, setKeywordsAr, setKeywordsEn, setTitleAr, setTitleEn, setDescriptionEn, setDescriptionAr, setEnEditorKey, setArEditorKey]
    );

    const [isUploadingCover, setIsUploadingCover] = useSafeState(false);

    interface UploadResponse { url?: string; status?: number; message?: string }

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

    const handleSaveOrUpdate = async (publish: boolean) => {
        setLoading(true);
        try {
            const articlePayload: CreateArticleDTO = {
                titleEn,
                titleAr,
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
                slugEn: generateSlug(titleEn),
                slugAr: generateSlug(titleAr),
            };

            if (articleId) {
                // Update existing article
                await updateArticle(articleId, articlePayload, coverImage);
            } else {
                // Create new article
                await createArticle(articlePayload, coverImage);
            }

            router.push('/admin/articles');
        } catch (error) {
            console.error("Error saving/updating article:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Section id="new-article" ariaLabelledBy="new-article-header" className="container mx-auto py-10 flex flex-col items-center">
            <h1 id="new-article-header" className="text-4xl font-bold text-center mb-10">New Article</h1>
            <div className="flex flex-col p-6 border max-w-full w-full gap-6 rounded-md bg-primary-color text-secondary-color">
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
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </Box>
                    ) : (
                        coverImageUrl && (
                            <NextImage src={coverImageUrl} alt="Cover Image" width={300} height={300} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} unoptimized />
                        )
                    )
                }
                <div className='border rounded bg-inherit border-secondary-color'>
                    <h2 className="text-lg font-semibold border-b-2 border-secondary-color p-4">Content (English)</h2>
                    <Editor key={'en'} editorKey={enEditorKey} initialValue={contentEn} onChange={setContentEn} onTextChange={setTextEn} dir='ltr' editable={true} />
                </div>
                <div className='border rounded bg-inherit border-secondary-color'>
                    <h2 className="text-lg font-semibold border-b-2 border-secondary-color p-4">Content (Arabic)</h2>
                    <Editor key={'ar'} editorKey={arEditorKey} initialValue={contentAr} onChange={setContentAr} onTextChange={setTextAr} dir='rtl' editable={true} />
                </div>
                {
                    articleId && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
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
                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                            <Button variant="outlined" disabled={loading || isUploadingCover} onClick={() => handleSaveOrUpdate(false)}>
                                {loading ? 'Saving...' : (isUploadingCover ? 'Uploading image...' : 'Save as Draft')}
                            </Button>
                            <Button variant="contained" disabled={loading || isUploadingCover} onClick={() => handleSaveOrUpdate(true)}>
                                {loading ? 'Publishing...' : (isUploadingCover ? 'Uploading image...' : 'Publish')}
                            </Button>
                        </Box>
                    )
                }
            </div>
        </Section>
    );
};
