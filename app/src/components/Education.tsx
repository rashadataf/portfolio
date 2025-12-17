type EducationProps = {
    institution: string;
    degree: string;
    field: string;
    from: string;
    to: string;
}

export const Education = ({ institution, degree, field, from, to }: EducationProps) => {
    return (
        <div className="mb-10 ml-4">
            <h4 className="text-lg font-bold">{institution}</h4>
            <p className="font-semibold">{degree} in {field}</p>
            <p className="my-2 text-accent-color font-semibold">{from} - {to}</p>
        </div>
    );
}
