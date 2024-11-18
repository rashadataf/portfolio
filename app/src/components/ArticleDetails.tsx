"use client";
import { Article } from "@/modules/article/article.entity";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Editor } from "@/components/Editor/Editor";

type Props = {
    article: Article;
};

export const ArticleDetails = ({ article }: Props) => {
    const [language, setLanguage] = useSafeState("en");
    const isArabic = language === "ar";
    const dir = isArabic ? "rtl" : "ltr";
    return (
        <section className="container mx-auto py-10 px-4">
            <div className="flex justify-between items-center mb-6" dir={dir}>
                <div>
                    <h1 className="text-3xl font-bold">
                        {isArabic ? article.titleAr : article.titleEn}
                    </h1>
                    <p className="text-gray-600 mb-8">By {article.author}</p>
                </div>
                <button
                    onClick={() => setLanguage(isArabic ? "en" : "ar")}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    {isArabic ? "View in English" : "عرض باللغة العربية"}
                </button>
            </div>
            <div
                className={`rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 ${isArabic ? "text-right" : "text-left"}`}
                dir={dir}
            >
                <Editor
                    key={language}
                    editable={false}
                    initialValue={isArabic ? article.contentAr : article.contentEn}
                    dir={dir}
                    onChange={() => { }}
                />
            </div>
        </section>
    );
};
