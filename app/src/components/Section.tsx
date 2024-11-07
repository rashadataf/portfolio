interface SectionProps {
    id: string;
    ariaLabelledBy: string;
    className?: string;
    children: React.ReactNode;
}

export const Section = ({ id, ariaLabelledBy, className = "", children }: SectionProps) => {
    return (
        <section
            id={id}
            aria-labelledby={ariaLabelledBy}
            className={className}
        >
            {children}
        </section>
    )
}
