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
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Share from '@mui/icons-material/Share';
import Divider from '@mui/material/Divider';
import TableOfContents from '@/components/TableOfContents';
import '@/app/prosemirror.css';

type Props = {
    article: Article;
    lang: 'en' | 'ar';
};

export const ArticleDetails = ({ article, lang }: Props) => {
    const router = useRouter();
    const [maxScrollDepth, setMaxScrollDepth] = useSafeState(0);
    const [progress, setProgress] = useSafeState(0);
    const [drawerOpen, setDrawerOpen] = useSafeState(false);

    const handleLanguageToggle = () => {
        const newLang = lang === 'ar' ? 'en' : 'ar';
        const slug = newLang === 'ar' ? article.slugAr : article.slugEn;
        trackClickEvent('language_toggle', `toggle_to_${newLang}`);
        router.push(`/articles/${slug}?lang=${newLang}`);
    };

    const isArabic = lang === "ar";
    const dir = isArabic ? "rtl" : "ltr";

    // Reading time (simple heuristic: 200 wpm)
    const plainText = (isArabic ? article.contentAr : article.contentEn)?.content ? JSON.stringify(isArabic ? article.contentAr : article.contentEn) : '';
    const words = plainText ? (plainText.match(/\w+/g) || []).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const [applauseCount, setApplauseCount] = useSafeState<number>(() => {
        try {
            const key = `applause_${article.id}`;
            const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
            return stored ? parseInt(stored, 10) : 0;
        } catch {
            return 0;
        }
    });

    const handleApplaud = () => {
        setApplauseCount((c) => {
            const nc = c + 1;
            try { localStorage.setItem(`applause_${article.id}`, String(nc)); } catch { }
            return nc;
        });
        // Small visual feedback: use toast or simple animation
        // We'll add a tiny CSS-based burst animation by toggling a data attribute
        const root = document.getElementById(`article-${article.id}`);
        if (root) {
            root.dataset.applaud = '1';
            setTimeout(() => { if (root) delete root.dataset.applaud; }, 700);
        }
    };

    useEffect(() => {
        // Keep a ref for max scroll depth so the effect doesn't re-run on every scroll
        const maxScrollRef = { current: maxScrollDepth } as { current: number };

        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScrollDepth = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
            const clamped = Math.min(100, Math.max(0, currentScrollDepth));
            setProgress(clamped);
            // update the ref and local state
            maxScrollRef.current = Math.max(maxScrollRef.current, clamped);
            setMaxScrollDepth((prevDepth) => Math.max(prevDepth, clamped));
        };

        const initMetrics = () => {
            trackPageVisit(`Article_${article.id}`);
            trackBlogView(article.id.toString());
        };

        initMetrics();

        window.addEventListener('scroll', handleScroll);

        return () => {
            reportScrollDepth(maxScrollRef.current, article.id.toString());
            window.removeEventListener('scroll', handleScroll);
        };
        // only re-run if the article changes
    }, [article.id, maxScrollDepth, setMaxScrollDepth, setProgress]);

    useEffect(() => {
        const content = document.getElementById('article-content');
        if (content) {
            content.classList.add('fade-in');
        }
    }, []);

    const handleInteraction = () => {
        markInteraction();
    };

    return (
        <>
            {/* Reading progress bar (fixed at top) */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', zIndex: 2000, pointerEvents: 'none' }}>
                <Box sx={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, rgba(59,130,246,1), rgba(99,102,241,1))', transition: 'width 0.08s linear' }} />
            </Box>
            <Container
                id={`article-${article.id}`}
                maxWidth="lg"
                sx={{ py: { xs: 4, md: 10 }, px: { xs: 2, md: 10, xl: 12 }, lineHeight: 'relaxed' }}
                onClick={handleInteraction}
                onScroll={handleInteraction}
            >
                {/* Small metadata row: author, reading time, applause */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>By {article.author}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>• {readingTime} min read</Typography>
                    <Button variant="outlined" size="small" onClick={handleApplaud} sx={{ ml: 'auto' }}>
                        👏 {applauseCount}
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => navigator.share({ title: article.titleEn, url: window.location.href })} sx={{ ml: 1 }}>
                        <Share /> Share
                    </Button>
                </Box>
                {/* Add ARIA for screen readers */}
                <Box component="main" role="main" aria-labelledby="article-title">
                    {article.coverImage && (
                        <Box sx={{ position: 'relative', mb: 10, width: '100%', height: '50vh', borderRadius: 2, overflow: 'hidden' }}>
                            <Image
                                src={article.coverImage}
                                alt={isArabic ? article.titleAr : article.titleEn}
                                fill
                                sizes="(max-width:599px) 100vw, (max-width:1199px) 720px, 1200px"
                                style={{ objectFit: 'cover' }}
                                priority
                            />
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 6, gap: 4 }} dir={dir}>
                        <Typography id="article-title" variant="h1" sx={{ fontWeight: 'extrabold', lineHeight: 'tight', letterSpacing: 'tight', color: 'text.primary' }}>
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

                    <Box sx={{ display: 'flex', gap: 6 }}>
                        {isArabic ? (
                            <>
                                <Box sx={{ display: { xs: 'none', md: 'block' }, width: 280 }}>
                                    <TableOfContents contentId="article-content" dir={dir} />
                                </Box>
                                <Box component="main" sx={{ flex: 1 }}>
                                    <Box
                                        id="article-content"
                                        sx={{ textAlign: isArabic ? 'right' : 'left', fontSize: '1.125rem', lineHeight: 1.8 }}
                                        dir={dir}
                                    >
                                        <Viewer
                                            key={lang}
                                            initialValue={isArabic ? article.contentAr : article.contentEn}
                                            dir={dir}
                                        />
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box component="main" sx={{ flex: 1 }}>
                                    <Box
                                        id="article-content"
                                        sx={{ textAlign: isArabic ? 'right' : 'left', fontSize: '1.125rem', lineHeight: 1.8 }}
                                        dir={dir}
                                    >
                                        <Viewer
                                            key={lang}
                                            initialValue={isArabic ? article.contentAr : article.contentEn}
                                            dir={dir}
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ display: { xs: 'none', md: 'block' }, width: 280 }}>
                                    <TableOfContents contentId="article-content" dir={dir} />
                                </Box>
                            </>
                        )}
                    </Box>
                    <Divider sx={{ my: 4 }} />
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">Comments</Typography>
                        {/* Placeholder for comment system */}
                        <div id="comments">Comments coming soon...</div>
                    </Box>
                </Box>
            </Container>

            {/* Mobile TOC Drawer */}
            <Fab
                color="primary"
                aria-label="table of contents"
                sx={{ position: 'fixed', bottom: 16, ...(isArabic ? { left: 16 } : { right: 16 }), display: { xs: 'flex', md: 'none' } }}
                onClick={() => setDrawerOpen(true)}
            >
                <MenuBookIcon />
            </Fab>
            <Drawer
                anchor={isArabic ? 'left' : 'right'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 280, p: 2 }}>
                    <TableOfContents contentId="article-content" dir={dir} />
                </Box>
            </Drawer>
        </>
    );
};
