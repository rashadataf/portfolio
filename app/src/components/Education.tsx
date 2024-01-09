type EducationProps = {
    institution: string;
    degree: string;
    field: string;
    from: string;
    to: string;
}

export const Education = ({ institution, degree, field, from, to }: EducationProps) => {
    return (
        <div className="mb-10">
            <h4 className="text-lg font-bold">{institution}</h4>
            <p className="text-gray-600">{degree} in {field}</p>
            <p className="my-2 text-primary">{from} - {to}</p>
        </div>
    );
}
