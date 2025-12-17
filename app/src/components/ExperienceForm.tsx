'use client';

import { useState } from 'react';
import { Experience } from '@/modules/experience/experience.entity';
import { createExperience, updateExperience } from '@/modules/experience/experience.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';

interface ExperienceFormProps {
    initialData?: Experience;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ExperienceForm = ({ initialData, onSuccess, onCancel }: ExperienceFormProps) => {
    const [formData, setFormData] = useState({
        company: initialData?.company || '',
        position: initialData?.position || '',
        location: initialData?.location || '',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        responsibilities: initialData?.responsibilities?.join('\n') || '',
        displayOrder: initialData?.displayOrder || 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            const responsibilitiesArray = formData.responsibilities
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            const dataToSubmit = {
                ...formData,
                responsibilities: responsibilitiesArray,
            };

            let result;
            if (initialData) {
                result = await updateExperience(initialData.id, dataToSubmit);
            } else {
                result = await createExperience(dataToSubmit);
            }

            if (result.success) {
                toast.success(`Experience ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} experience`);
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
                <label htmlFor="company" className="block text-sm font-medium text-gray-300">
                    Company
                </label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-300">
                    Position
                </label>
                <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                    Location
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
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
                        placeholder="e.g. Dec 2021"
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
                        placeholder="e.g. Present"
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-300">
                    Responsibilities (one per line)
                </label>
                <textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    rows={5}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
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
                    {isLoading ? 'Saving...' : initialData ? 'Update Experience' : 'Create Experience'}
                </Button>
            </div>
        </form>
    );
};
