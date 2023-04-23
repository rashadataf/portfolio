import { useEffect, useRef, useState } from "react";

export function useIntersect(props?: IntersectionObserverInit) {
    const node = useRef<HTMLElement | null>();
    const [isVisible, setIsVisible] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting)
        }, props);
        const { current: currentObserver } = observer;
        if (node.current) currentObserver.observe(node.current);
        return () => currentObserver.disconnect();
    }, [node, props && props.root, props && props.rootMargin, props && props.threshold]);

    return [node, isVisible] as const;
};
