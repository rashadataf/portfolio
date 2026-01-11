"use client";

import { useEffect } from "react";
import { Article } from "@/modules/article/article.entity";
import { Viewer } from "@/components/Editor/Viewer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { markInteraction, reportScrollDepth, trackBlogView, trackClickEvent, trackPageVisit } from "@/modules/analytics/analytics.controller";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

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
        <Container
            maxWidth="lg"
            sx={{ py: 10, px: { xs: 6, md: 10, xl: 12 }, lineHeight: 'relaxed' }}
            onClick={handleInteraction}
            onScroll={handleInteraction}
        >
            {article.coverImage && (
                <Box sx={{ position: 'relative', mb: 10, width: '100%', height: '50vh', borderRadius: 2, overflow: 'hidden' }}>
                    <Image
                        src={article.coverImage}
                        alt={isArabic ? article.titleAr : article.titleEn}
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 6, gap: 4 }} dir={dir}>
                <Typography variant="h1" sx={{ fontWeight: 'extrabold', lineHeight: 'tight', letterSpacing: 'tight', color: 'text.primary' }}>
                    {isArabic ? article.titleAr : article.titleEn}
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>By {article.author}</Typography>
                <Button
                    onClick={handleLanguageToggle}
                    variant="contained"
                    sx={{ px: 5, py: 2 }}
                >
                    {isArabic ? "View in English" : "عرض باللغة العربية"}
                </Button>
            </Box>

            <Box
                sx={{ textAlign: isArabic ? 'right' : 'left', fontSize: '1.125rem', lineHeight: 1.8 }}
                dir={dir}
            >
                <Viewer
                    key={lang}
                    initialValue={isArabic ? article.contentAr : article.contentEn}
                    dir={dir}
                />
            </Box>
        </Container>
    );
};
