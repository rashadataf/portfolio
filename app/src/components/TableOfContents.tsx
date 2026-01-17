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

    useEffect(() => {
        const root = document.getElementById(contentId);
        if (!root) return;


        // Helper to scan headings and populate TOC
        const scanAndPopulate = () => {
            const headingElems = Array.from(root.querySelectorAll('h1,h2,h3')) as HTMLElement[];
            if (!headingElems.length) return false;

            const toc: TOCItem[] = headingElems.map((h) => {
                if (!h.id) {
                    h.id = slugify(h.innerText || h.textContent || 'heading');
                }
                const level = parseInt(h.tagName.replace('H', ''), 10) || 1;
                return { id: h.id, text: h.innerText || h.textContent || '', level };
            });

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

        // IntersectionObserver to highlight current heading
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length) {
                    setActiveId(visible[0].target.id);
                }
            },
            { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0, 0.1, 0.5, 1] }
        );

        observerRef.current = obs;
        // Observe whatever headings currently exist (scan again)
        const currentHeadings = Array.from(root.querySelectorAll('h1,h2,h3')) as HTMLElement[];
        currentHeadings.forEach((h) => obs.observe(h));

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
        };
    }, [activeId, contentId]);

    const handleGoto = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                    {items.map((it) => (
                        <ListItem key={it.id} sx={{ pl: Math.max(1, (it.level - 1) * 2) }}>
                            <ListItemButton onClick={() => handleGoto(it.id)} selected={activeId === it.id}>
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
