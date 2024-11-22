import { useRef, useCallback } from 'react';
export function useSnapScroll() {
    const autoScrollRef = useRef(true);
    const scrollNodeRef = useRef();
    const onScrollRef = useRef();
    const observerRef = useRef();
    const messageRef = useCallback((node) => {
        if (node) {
            const observer = new ResizeObserver(() => {
                if (autoScrollRef.current && scrollNodeRef.current) {
                    const { scrollHeight, clientHeight } = scrollNodeRef.current;
                    const scrollTarget = scrollHeight - clientHeight;
                    scrollNodeRef.current.scrollTo({
                        top: scrollTarget,
                    });
                }
            });
            observer.observe(node);
        }
        else {
            observerRef.current?.disconnect();
            observerRef.current = undefined;
        }
    }, []);
    const scrollRef = useCallback((node) => {
        if (node) {
            onScrollRef.current = () => {
                const { scrollTop, scrollHeight, clientHeight } = node;
                const scrollTarget = scrollHeight - clientHeight;
                autoScrollRef.current = Math.abs(scrollTop - scrollTarget) <= 10;
            };
            node.addEventListener('scroll', onScrollRef.current);
            scrollNodeRef.current = node;
        }
        else {
            if (onScrollRef.current) {
                scrollNodeRef.current?.removeEventListener('scroll', onScrollRef.current);
            }
            scrollNodeRef.current = undefined;
            onScrollRef.current = undefined;
        }
    }, []);
    return [messageRef, scrollRef];
}
