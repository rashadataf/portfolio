'use client';
import { useEffect, useRef } from 'react';
import { useSafeState } from '@/hooks/useSafeState.hook';


interface SkillProps {
    name: string;
    percentage: number;
}

export const Skill = ({ name, percentage }: SkillProps) => {
    const [width, setWidth] = useSafeState<string>('0%');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setWidth(`${percentage}%`);
            } else {
                setWidth('0%');
            }
        }, { threshold: 0.6 });

        const currentDiv = ref.current;

        if (currentDiv) {
            observer.observe(currentDiv);
        }

        return () => {
            if (currentDiv) {
                observer.unobserve(currentDiv);
            }
        };
    }, [percentage, setWidth]);

    return (
        <div ref={ref} className="flex items-center space-x-3 border-secondary border-b-[.1px] py-3">
            <span className="text-main font-medium w-2/5">{name}</span>
            <div className="border-primary border-[0.1px] w-3/5 rounded-full" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                <div className="bg-[--text-color] h-[6px] rounded-full transition-all duration-1000" style={{ width: width }}>
                    <span className="sr-only">{percentage}% proficient</span>
                </div>
            </div>
        </div>
    );
}
