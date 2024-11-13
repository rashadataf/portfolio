"use client";
import '@/app/prosemirror.css';
import { JSONContent } from "novel";
import { Editor } from "@/components/Editor/Editor";
import { defaultValue } from "@/app/default-value";
import { Section } from "@/components/Section";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArticleStatus } from '@/types';

export const NewArticlePage = () => {
    const router = useRouter();

    const [titleEn, setTitleEn] = useSafeState("");
    const [titleAr, setTitleAr] = useSafeState("");
    const [author, setAuthor] = useSafeState("");
    const [keywordsEn, setKeywordsEn] = useSafeState("");
    const [keywordsAr, setKeywordsAr] = useSafeState("");
    const [contentEn, setContentEn] = useSafeState<JSONContent>(defaultValue);
    const [contentAr, setContentAr] = useSafeState<JSONContent>(defaultValue);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (publish: boolean) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title_en: titleEn,
                    title_ar: titleAr,
                    author,
                    status: publish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
                    keywords_en: keywordsEn.split(",").map(kw => kw.trim()),
                    keywords_ar: keywordsAr.split(",").map(kw => kw.trim()),
                    content_en: contentEn,
                    content_ar: contentAr,
                    slug_en: titleEn.toLowerCase().replace(/ /g, "-"),
                    slug_ar: titleAr.toLowerCase().replace(/ /g, "-"),
                })
            });

            if (response.ok) {
                router.push('/admin/articles');
            } else {
                console.error("Failed to save article", response.statusText);
            }
        } catch (error) {
            console.error("Error saving article:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Section id="new-article" ariaLabelledBy="new-article-header" className="container mx-auto py-10 flex flex-col items-center">
            <h1 id="new-article-header" className="text-4xl font-bold text-center mb-10">New Article</h1>
            <div className="flex flex-col p-6 border max-w-xl w-full gap-6 rounded-md bg-card">
                <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Title (English)"
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="Title (Arabic)"
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author"
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    value={keywordsEn}
                    onChange={(e) => setKeywordsEn(e.target.value)}
                    placeholder="Keywords (English, comma-separated)"
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    value={keywordsAr}
                    onChange={(e) => setKeywordsAr(e.target.value)}
                    placeholder="Keywords (Arabic, comma-separated)"
                    className="p-2 border rounded"
                />
                <div>
                    <h2 className="text-lg font-semibold">Content (English)</h2>
                    <Editor initialValue={contentEn} onChange={setContentEn} />
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Content (Arabic)</h2>
                    <Editor initialValue={contentAr} onChange={setContentAr} />
                </div>
                <div className="flex gap-4 mt-4">
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
            </div>
        </Section>
    );
};
