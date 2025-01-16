"use client";
import { Article } from "@/modules/article/article.entity";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Viewer } from "@/components/Editor/Viewer";
import Image from "next/image";

type Props = {
    article: Article;
};

export const ArticleDetails = ({ article }: Props) => {
    const [language, setLanguage] = useSafeState("en");
    const isArabic = language === "ar";
    const dir = isArabic ? "rtl" : "ltr";

    return (
        <section className="max-w-3xl mx-auto py-10 px-6 md:px-10 xl:px-12 leading-relaxed">
            {article.coverImage && (
                <div className="relative mb-10 w-full h-[50vh] rounded-lg overflow-hidden">
                    <Image
                        src={article.coverImage}
                        alt={isArabic ? article.titleAr : article.titleEn}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div className="flex flex-col items-start mb-6 space-y-4" dir={dir}>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
                    {isArabic ? article.titleAr : article.titleEn}
                </h1>
                <p className="text-lg text-gray-600">By {article.author}</p>
                <button
                    onClick={() => setLanguage(isArabic ? "en" : "ar")}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    {isArabic ? "View in English" : "عرض باللغة العربية"}
                </button>
            </div>

            <div
                className={`${isArabic ? "text-right" : "text-left"} text-lg leading-[1.8]`}
                dir={dir}
            >
                <Viewer
                    key={language}
                    initialValue={isArabic ? article.contentAr : article.contentEn}
                    dir={dir}
                />
            </div>
        </section>
    );
};