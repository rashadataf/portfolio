"use client";

import { useEffect, useState, useRef } from "react";
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

type TOCItem = {
    id: string;
    text: string;
    level: number;
};

function slugify(s: string) {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

interface Props {
    contentId?: string; // DOM id of the container to scan for headings
}

export const TableOfContents = ({ contentId = 'article-content' }: Props) => {
    const [items, setItems] = useState<TOCItem[]>([]);
    const [open, setOpen] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const rafRef = useRef<number | null>(null);
    const itemsRef = useRef<TOCItem[]>([]);
    const mutRef = useRef<MutationObserver | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const headingsRef = useRef<HTMLElement[]>([]);
    const scrollRafRef = useRef<number | null>(null);
    const manualScrollTimeoutRef = useRef<number | null>(null);
    const manualScrollingRef = useRef<boolean>(false);

    useEffect(() => {
        const root = document.getElementById(contentId);
        if (!root) return;


        // Helper to scan headings and populate TOC
        const scanAndPopulate = () => {
            // also include elements that may be rendered with role=heading (aria-based headings)
            const nodeList = root.querySelectorAll('h1,h2,h3,[role="heading"]');
            const headingElems = Array.from(nodeList) as HTMLElement[];
            if (!headingElems.length) return false;

            const toc: TOCItem[] = headingElems.map((h) => {
                const rawText = (h.innerText || h.textContent || '').toString().trim();
                if (!h.id) {
                    h.id = slugify(rawText || 'heading');
                }

                let level = 1;
                if (h.tagName && /^H[1-6]$/.test(h.tagName)) {
                    level = parseInt(h.tagName.replace('H', ''), 10) || 1;
                } else if (h.getAttribute) {
                    const ariaLevel = h.getAttribute('aria-level');
                    if (ariaLevel) level = parseInt(ariaLevel, 10) || 1;
                }

                return { id: h.id, text: rawText, level };
            });

            // store heading elements for scroll-based fallback
            headingsRef.current = headingElems;

            // Defer setting state to avoid synchronous setState inside the effect
            rafRef.current = requestAnimationFrame(() => {
                setItems(toc);
                itemsRef.current = toc;
                if (toc.length && !activeId) setActiveId(toc[0].id);
            });

            return true;
        };

        // Initial scan; if no headings yet, observe mutations inside the root
        const found = scanAndPopulate();
        if (!found) {
            mutRef.current = new MutationObserver(() => {
                const ok = scanAndPopulate();
                if (ok) {
                    // after headings appear, make sure observer watches them
                    const newHeadings = Array.from(root.querySelectorAll('h1,h2,h3,[role="heading"]')) as HTMLElement[];
                    headingsRef.current = newHeadings;
                    if (observerRef.current) newHeadings.forEach(h => observerRef.current?.observe(h));
                }
                if (ok && mutRef.current) {
                    mutRef.current.disconnect();
                }
            });
            mutRef.current.observe(root, { childList: true, subtree: true });

            // Fallback: try again after a short delay in case headings render slightly later
            timeoutRef.current = window.setTimeout(() => {
                const ok = scanAndPopulate();
                if (ok && mutRef.current) mutRef.current.disconnect();
            }, 500);
        }

        // IntersectionObserver kept to trigger recalculation when intersections change
        const obs = new IntersectionObserver(
            () => {
                // Defer to the unified distance-based computation for consistency
                updateActiveFromScroll();
            },
            { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0, 0.01, 0.1, 0.5, 1] }
        );

        observerRef.current = obs;
        // Observe whatever headings currently exist (scan again)
        const currentHeadings = Array.from(root.querySelectorAll('h1,h2,h3,[role="heading"]')) as HTMLElement[];
        headingsRef.current = currentHeadings;
        currentHeadings.forEach((h) => obs.observe(h));

        // Scroll-based detection: choose heading whose center is closest to viewport center
        const updateActiveFromScroll = () => {
            if (manualScrollingRef.current) return;

            const hs = headingsRef.current;
            if (!hs || !hs.length) return;

            const stickyHeaderHeight = 120; // Adjust based on your header height
            const visibleStart = stickyHeaderHeight;
            const visibleHeight = window.innerHeight - stickyHeaderHeight;
            const viewportCenterY = visibleStart + visibleHeight / 2;
            let bestId: string | null = null;
            let bestDistance = Number.POSITIVE_INFINITY;

            for (let i = 0; i < hs.length; i++) {
                const rect = hs[i].getBoundingClientRect();
                const elemCenter = rect.top + rect.height / 2;
                const distance = Math.abs(elemCenter - viewportCenterY);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestId = hs[i].id;
                }
            }

            // If at bottom (within 50px), prefer the last heading
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
            if (atBottom) {
                const last = hs[hs.length - 1];
                if (last) {
                    if (bestId !== last.id) setActiveId(last.id);
                    return;
                }
            }

            // Switch unconditionally to the closest heading center (avoid hysteresis flicker)
            if (bestId && bestId !== activeId) {
                setActiveId(bestId);
            }
        };

        const onScroll = () => {
            if (scrollRafRef.current != null) cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = requestAnimationFrame(updateActiveFromScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        // run once to initialize
        updateActiveFromScroll();

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (mutRef.current) {
                mutRef.current.disconnect();
            }
            if (timeoutRef.current != null) {
                clearTimeout(timeoutRef.current);
            }
            if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
            }
            if (scrollRafRef.current != null) {
                cancelAnimationFrame(scrollRafRef.current);
            }
            if (manualScrollTimeoutRef.current != null) {
                clearTimeout(manualScrollTimeoutRef.current);
            }
            window.removeEventListener('scroll', onScroll);
        };
    }, [activeId, contentId]);

    const handleGoto = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        manualScrollingRef.current = true;

        // Immediately mark as active for instant feedback
        setActiveId(id);

        // Clear any pending manual timeout
        if (manualScrollTimeoutRef.current != null) {
            clearTimeout(manualScrollTimeoutRef.current);
            manualScrollTimeoutRef.current = null;
        }

        // Try scrollIntoView first with center block for better visibility
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

        // Check if scroll happened after a delay
        const initialScrollY = window.scrollY;
        console.log(`TOC.goto initial scroll: ${initialScrollY} for ${id}`);
        setTimeout(() => {
            const currentScrollY = window.scrollY;
            console.log(`TOC.goto after scrollIntoView: ${currentScrollY} for ${id}, moved: ${Math.abs(currentScrollY - initialScrollY)}`);
            if (Math.abs(currentScrollY - initialScrollY) < 5) { // Lower threshold
                // Scroll didn't move, fallback to manual scroll
                const rect = el.getBoundingClientRect();
                const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
                const targetY = elementCenterY - window.innerHeight / 2;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const clampedY = Math.max(0, Math.min(targetY, maxScroll));
                console.log(`TOC.goto manual target: ${targetY}, clamped: ${clampedY} for ${id}`);

                window.scrollTo({ top: clampedY, behavior: 'smooth' });
            }

            // Update hash safely
            if (window.history.replaceState) {
                window.history.replaceState(null, '', `#${id}`);
            } else {
                window.location.hash = id;
            }

            // Re-evaluate active heading - removed to let scroll event handle it
            // updateActiveFromScroll();
            manualScrollingRef.current = false;
            manualScrollTimeoutRef.current = null;
        }, 1000); // Increased timeout
    };

    if (!items.length) return null;

    return (
        <Box sx={{ width: { xs: '100%', md: 280 }, position: { md: 'sticky' }, top: { md: 120 }, alignSelf: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <MenuBookIcon sx={{ color: 'text.secondary' }} />
                <Box sx={{ fontWeight: 600 }}>On this page</Box>
                <Box sx={{ flex: 1 }} />
                <IconButton size="small" onClick={() => setOpen((v) => !v)} aria-label="toggle table of contents">
                    {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <List dense disablePadding>
                    {items.map((it, idx) => (
                        <ListItem key={`${it.id}-${idx}`} role="listitem" sx={{ pl: Math.max(1, (it.level - 1) * 2) }}>
                            <ListItemButton
                                component="button"
                                onClick={() => handleGoto(it.id)}
                                selected={activeId === it.id}
                                id={`toc-btn-${it.id}`}
                                onKeyDown={(e) => {
                                    // keyboard navigation inside TOC
                                    if (e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        const next = items[idx + 1];
                                        if (next) {
                                            const btn = document.getElementById(`toc-btn-${next.id}`) as HTMLButtonElement | null;
                                            btn?.focus();
                                            setActiveId(next.id);
                                        }
                                    } else if (e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        const prev = items[idx - 1];
                                        if (prev) {
                                            const btn = document.getElementById(`toc-btn-${prev.id}`) as HTMLButtonElement | null;
                                            btn?.focus();
                                            setActiveId(prev.id);
                                        }
                                    } else if (e.key === 'Home') {
                                        e.preventDefault();
                                        const first = items[0];
                                        const btn = first && (document.getElementById(`toc-btn-${first.id}`) as HTMLButtonElement | null);
                                        btn?.focus();
                                        if (first) setActiveId(first.id);
                                    } else if (e.key === 'End') {
                                        e.preventDefault();
                                        const last = items[items.length - 1];
                                        const btn = last && (document.getElementById(`toc-btn-${last.id}`) as HTMLButtonElement | null);
                                        btn?.focus();
                                        if (last) setActiveId(last.id);
                                    } else if (e.key === 'Enter' || e.key === ' ') {
                                        // activate
                                        e.preventDefault();
                                        handleGoto(it.id);
                                    }
                                }}
                                aria-current={activeId === it.id ? 'true' : undefined}
                            >
                                <ListItemText primary={it.text} slotProps={{ primary: { noWrap: true, variant: 'body2' } }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </Box>
    );
};

export default TableOfContents;
