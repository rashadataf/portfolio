"use client";
import '@/app/prosemirror.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// import dynamic from 'next/dynamic';
import { JSONContent } from "novel";

// import { defaultValue } from "@/app/default-value";
import { Section } from "@/components/Section";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { ArticleStatus } from '@/types';
import { createArticle, getArticleById } from '@/modules/article/article.controller';
import { CreateArticleDTO } from '@/modules/article/article.dto';
import { Editor } from './Editor/Editor';

interface ArticlePageProps {
    editable: boolean;
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

export const ArticlePage = ({ editable, articleId }: ArticlePageProps) => {
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

    useEffect(
        () => {
            if (!articleId) return;
            const fetchArticle = async () => {
                try {
                    const response = await getArticleById(articleId);
                    const article = response.article;

                    if (article) {
                        console.log('article.contentEn: ', article.contentEn);
                        console.log('article.contentAr: ', article.contentAr);
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
                    }
                } catch (error) {
                    console.error("Error fetching article:", error);
                }
            };

            fetchArticle();
        },
        [articleId, setAuthor, setContentAr, setContentEn, setCoverImage, setCoverImageUrl, setKeywordsAr, setKeywordsEn, setTitleAr, setTitleEn]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCoverImage(file);
    };

    const handleSubmit = async (publish: boolean) => {
        setLoading(true);
        try {
            const newArticle: CreateArticleDTO = {
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
                slugEn: titleEn.toLowerCase().replace(/ /g, "-"),
                slugAr: titleAr.toLowerCase().replace(/ /g, "-"),
            };

            await createArticle(newArticle, coverImage);

            router.push('/admin/articles');
        } catch (error) {
            console.error("Error saving article:", error);
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
                    readOnly={!editable}
                />
                <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="العنوان (العربي)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    dir='rtl'
                    required
                    readOnly={!editable}
                />
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                    readOnly={!editable}
                />
                <input
                    type="text"
                    value={keywordsEn}
                    onChange={(e) => setKeywordsEn(e.target.value)}
                    placeholder="Keywords (English, comma-separated)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                    readOnly={!editable}
                />
                <input
                    type="text"
                    value={keywordsAr}
                    onChange={(e) => setKeywordsAr(e.target.value)}
                    placeholder="كلمات مفتاحية (بالعربي، مفصولة بالفاصلة)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    dir='rtl'
                    required
                    readOnly={!editable}
                />
                <input
                    type="text"
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Description (English)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    required
                    readOnly={!editable}
                />
                <input
                    type="text"
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="الوصف (بالعربي)"
                    className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                    dir="rtl"
                    required
                    readOnly={!editable}
                />
                {
                    editable ?
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="p-2 border rounded bg-inherit border-secondary-color placeholder-transparent-accent-color"
                            accept="image/*"
                        /> :
                        coverImageUrl && <Image
                            src={coverImageUrl}
                            alt="Cover"
                            className="max-w-full h-auto rounded"
                            width={300}
                            height={300}
                        />
                }
                <div className='border rounded bg-inherit border-secondary-color'>
                    <h2 className="text-lg font-semibold border-b-2 border-secondary-color p-4">Content (English)</h2>
                    <Editor initialValue={contentEn} onChange={setContentEn} onTextChange={setTextEn} dir='ltr' editable={editable} />
                </div>
                <div className='border rounded bg-inherit border-secondary-color'>
                    <h2 className="text-lg font-semibold border-b-2 border-secondary-color p-4">Content (Arabic)</h2>
                    <Editor initialValue={contentAr} onChange={setContentAr} onTextChange={setTextAr} dir='rtl' editable={editable} />
                </div>
                {
                    editable && <div className="flex gap-4 mt-4">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            {loading ? "Saving..." : "Save as Draft"}
                        </button>
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {loading ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                }
            </div>
        </Section>
    );
};
