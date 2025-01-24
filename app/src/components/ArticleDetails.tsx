"use client";

import { useEffect } from "react";
import { Article } from "@/modules/article/article.entity";
import { Viewer } from "@/components/Editor/Viewer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { markInteraction, reportScrollDepth, trackBlogView, trackClickEvent, trackPageVisit } from "@/modules/analytics/analytics.controller";

type Props = {
    article: Article;
    lang: 'en' | 'ar';
};

export const ArticleDetails = ({ article, lang }: Props) => {
    const router = useRouter();
    const [maxScrollDepth, setMaxScrollDepth] = useSafeState(0);

    const handleLanguageToggle = () => {
        const newLang = lang === 'ar' ? 'en' : 'ar';
        const slug = newLang === 'ar' ? article.slugAr : article.slugEn;
        trackClickEvent('language_toggle', `toggle_to_${newLang}`);
        router.push(`/articles/${slug}?lang=${newLang}`);
    };

    const isArabic = lang === "ar";
    const dir = isArabic ? "rtl" : "ltr";

    useEffect(
        () => {
            const handleScroll = () => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const currentScrollDepth = (window.scrollY / scrollHeight) * 100;
                setMaxScrollDepth((prevDepth) => Math.max(prevDepth, currentScrollDepth));
            };

            const initMetrics = () => {
                trackPageVisit(`Article_${article.id}`);
                trackBlogView(article.id.toString());
                // startSessionTimer();
                // checkBounceRate(`Article_${article.id}`);
            };

            initMetrics();

            window.addEventListener("scroll", handleScroll);

            return () => {
                reportScrollDepth(maxScrollDepth, article.id.toString());
                // endSessionTimer(`Article_${article.id}`);
                window.removeEventListener("scroll", handleScroll);
            };
        },
        [article.id, maxScrollDepth, setMaxScrollDepth]
    );

    const handleInteraction = () => {
        markInteraction();
    };

    return (
        <section
            className="max-w-3xl mx-auto py-10 px-6 md:px-10 xl:px-12 leading-relaxed"
            onClick={handleInteraction}
            onScroll={handleInteraction}
        >
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
                    onClick={handleLanguageToggle}
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
                    key={lang}
                    initialValue={isArabic ? article.contentAr : article.contentEn}
                    dir={dir}
                />
            </div>
        </section>
    );
};
