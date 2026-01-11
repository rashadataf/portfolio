'use client';
import { KeyboardEvent, ChangeEvent, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Article } from "@/modules/article/article.entity";
import { getPublishedArticles, serachPublishedArticles } from "@/modules/article/article.controller";
import { trackPageVisit } from "@/modules/analytics/analytics.controller";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

// Function to detect text direction (rtl or ltr)
const detectDirection = (text: string): "rtl" | "ltr" => {
    const rtlRegex = /[\u0600-\u06FF]/; // Unicode range for ARABIC characters

    if (rtlRegex.test(text)) {
        return "rtl";
    }

    return "ltr";
};

export const ArticlesPage = () => {
    const [searchQuery, setSearchQuery] = useSafeState("");
    const [inputDir, setInputDir] = useSafeState<"rtl" | "ltr">("ltr");
    const [articles, setArticles] = useSafeState<Article[]>([]);
    const [initialArticles, setInitialArticles] = useSafeState<Article[]>([]);
    const [searchPerformed, setSearchPerformed] = useSafeState(false);

    useEffect(
        () => {
            const fetchArticles = async () => {
                try {
                    const { articles } = await getPublishedArticles();
                    const fetchedArticles = articles ?? [];
                    setArticles(fetchedArticles);
                    setInitialArticles(fetchedArticles);
                } catch (error) {
                    console.error("Error fetching articles:", error);
                }
            };

            fetchArticles();
            trackPageVisit("Articles");
        },
        [setArticles, setInitialArticles]
    );

    const handleQueryChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);

            setInputDir(detectDirection(value));

            if (!value.trim().length) {
                setArticles(initialArticles);
                setInputDir('ltr');
                setSearchQuery('');
                setSearchPerformed(false);
            }
        },
        [initialArticles, setArticles, setInputDir, setSearchQuery, setSearchPerformed]
    );

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim().length) return;

        try {
            const searchResult = await serachPublishedArticles(searchQuery);
            setArticles(searchResult.articles ?? []);
            setSearchPerformed(true);
        } catch (error) {
            console.error("Error during search:", error);
        }
    }, [searchQuery, setArticles, setSearchPerformed]);

    const handleKeyDown = useCallback(
        async (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                await handleSearch();
            }
        },
        [handleSearch]
    );

    if (!articles.length && !searchQuery.trim()) {
        return (
            <Container maxWidth="md" sx={{ py: 10, px: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Typography variant="h1" sx={{ textAlign: 'center', mb: 4 }}>Articles Coming Soon!</Typography>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 6 }}>
                    I&apos;m currently working on some exciting articles. Stay tuned!
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}></Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 10, px: 4 }}>
            <Typography variant="h1" sx={{ textAlign: 'center', mb: 10 }}>Articles</Typography>

            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                <TextField
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                    slotProps={{ htmlInput: { dir: inputDir } }}
                    sx={{ maxWidth: 'md', width: '100%' }}
                />
                <Button
                    onClick={handleSearch}
                    disabled={searchQuery.length === 0}
                    variant="contained"
                    sx={{ ml: 2, p: 3 }}
                >
                    Search
                </Button>
            </Box>

            {
                searchQuery.length > 0 && articles.length === 0 && (
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>There are no results for your search.</Typography>
                )
            }

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 6 }}>
                {
                    articles.map((article) => (
                        <Link key={article.id} href={inputDir === "rtl" && searchPerformed ? `/articles/${article.slugAr}?lang=ar` : `/articles/${article.slugEn}?lang=en`} prefetch={false}>
                            <Card sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {
                                    article.coverImage && (
                                        <CardMedia
                                            component="img"
                                            image={article.coverImage}
                                            alt={inputDir === "rtl" && searchPerformed ? article.titleAr : article.titleEn}
                                            sx={{ height: 200, objectFit: 'cover' }}
                                        />
                                    )
                                }
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}>
                                        {inputDir === "rtl" && searchPerformed ? article.titleAr : article.titleEn}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: inputDir === 'rtl' && searchPerformed ? 'right' : 'left' }}>
                                        {inputDir === 'rtl' && searchPerformed ? `بواسطة ${article.author}` : `By ${article.author}`}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: inputDir === 'rtl' && searchPerformed ? 'right' : 'left' }}>
                                        {new Date(article.createdAt).toLocaleDateString(inputDir === 'rtl' && searchPerformed ? 'ar-sy' : 'en')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                }
            </Box>
        </Container>
    );
};
