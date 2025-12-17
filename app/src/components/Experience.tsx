type ExperienceProps = {
    position: string;
    location: string;
    company: string;
    from: string;
    to: string;
    responsibilities: string[];
}

export const Experience = ({ company, from, location, position, responsibilities, to }: ExperienceProps) => {
    return (
        <div className="mb-10 ml-4">
            <h4 className="text-base sm:text-lg font-bold mb-1">{position} - {company}, {location}</h4>
            <p className="my-2 text-accent-color font-semibold">{from} - {to}</p>
            <ul className="list-disc list-inside space-y-3">
                {responsibilities.map(
                    (item, index) => <li className="leading-5 ml-4" key={index}>{item}</li>
                )}
            </ul>
        </div>
    );
}
