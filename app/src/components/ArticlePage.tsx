"use client";
import '@/app/prosemirror.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { JSONContent } from "novel";
import { Section } from "@/components/Section";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { ArticleStatus } from '@/types';
import { createArticle, getArticleById, updateArticle } from '@/modules/article/article.controller';
import { CreateArticleDTO } from '@/modules/article/article.dto';
import { Loader } from '@/components//Loader';

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCoverImage(file);
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
                <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Title (English)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                />
                <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="العنوان (العربي)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    dir='rtl'
                    required
                />
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                />
                <input
                    type="text"
                    value={keywordsEn}
                    onChange={(e) => setKeywordsEn(e.target.value)}
                    placeholder="Keywords (English, comma-separated)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                />
                <input
                    type="text"
                    value={keywordsAr}
                    onChange={(e) => setKeywordsAr(e.target.value)}
                    placeholder="كلمات مفتاحية (بالعربي، مفصولة بالفاصلة)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    dir='rtl'
                    required
                />
                <input
                    type="text"
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Description (English)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                />
                <input
                    type="text"
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="الوصف (بالعربي)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    dir="rtl"
                    required
                />
                {
                    articleId ? (
                        <div className="flex flex-col gap-2">
                            {coverImageUrl && (
                                <div>
                                    <Image
                                        src={coverImageUrl}
                                        alt="Cover Preview"
                                        className="max-w-full h-auto rounded"
                                        width={300}
                                        height={300}
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                                accept="image/*"
                            />
                        </div>
                    ) : (
                        coverImageUrl && (
                            <Image
                                src={coverImageUrl}
                                alt="Cover Image"
                                className="max-w-full h-auto rounded"
                                width={300}
                                height={300}
                            />
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
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => handleSaveOrUpdate(false)}
                                disabled={loading}
                                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                {loading ? "Updating..." : "Save as Draft"}
                            </button>
                            <button
                                onClick={() => handleSaveOrUpdate(true)}
                                disabled={loading}
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {loading ? "Updating..." : "Publish"}
                            </button>
                        </div>
                    )
                }
                {
                    !articleId && (
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => handleSaveOrUpdate(false)}
                                disabled={loading}
                                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                {loading ? "Saving..." : "Save as Draft"}
                            </button>
                            <button
                                onClick={() => handleSaveOrUpdate(true)}
                                disabled={loading}
                                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {loading ? "Publishing..." : "Publish"}
                            </button>
                        </div>
                    )
                }
            </div>
        </Section>
    );
};
