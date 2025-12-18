'use client';

import { useState } from 'react';
import { Education } from '@/modules/education/education.entity';
import { createEducation, updateEducation } from '@/modules/education/education.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';

interface EducationFormProps {
    initialData?: Education;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EducationForm = ({ initialData, onSuccess, onCancel }: EducationFormProps) => {
    const [formData, setFormData] = useState({
        institution: initialData?.institution || '',
        degree: initialData?.degree || '',
        field: initialData?.field || '',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        displayOrder: initialData?.displayOrder || 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'displayOrder' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let result;
            if (initialData) {
                result = await updateEducation(initialData.id, formData);
            } else {
                result = await createEducation(formData);
            }

            if (result.success) {
                toast.success(`Education ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} education`);
            }
        } catch (error) {
            toast.error('An error occurred');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-300">
                    Institution
                </label>
                <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-300">
                    Degree
                </label>
                <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="field" className="block text-sm font-medium text-gray-300">
                    Field of Study
                </label>
                <input
                    type="text"
                    id="field"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                        Start Date
                    </label>
                    <input
                        type="text"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Sep 2012"
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                        End Date
                    </label>
                    <input
                        type="text"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Sep 2019"
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-300">
                    Display Order
                </label>
                <input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : initialData ? 'Update Education' : 'Create Education'}
                </Button>
            </div>
        </form>
    );
};
