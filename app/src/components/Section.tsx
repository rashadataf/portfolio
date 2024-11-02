interface SectionProps {
    id: string;
    ariaLabelledBy: string;
    className?: string;
    children: React.ReactNode;
}

export default function Section({ id, ariaLabelledBy, className = "", children }: SectionProps) {
    return (
        <section
            id={id}
            aria-labelledby={ariaLabelledBy}
            className={`w-full p-4 ${className}`}
        >
            {children}
        </section>
    )
}
