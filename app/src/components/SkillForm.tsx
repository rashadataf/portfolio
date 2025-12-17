'use client';

import { useState } from 'react';
import { Skill, SkillCategory } from '@/modules/skill/skill.entity';
import { createSkill, updateSkill } from '@/modules/skill/skill.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';

interface SkillFormProps {
    initialData?: Skill;
    onSuccess: () => void;
    onCancel: () => void;
}

export const SkillForm = ({ initialData, onSuccess, onCancel }: SkillFormProps) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        percentage: initialData?.percentage || 50,
        category: initialData?.category || SkillCategory.Proficient,
        displayOrder: initialData?.displayOrder || 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'percentage' || name === 'displayOrder' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let result;
            if (initialData) {
                result = await updateSkill(initialData.id, formData);
            } else {
                result = await createSkill(formData);
            }

            if (result.success) {
                toast.success(`Skill ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} skill`);
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Skill Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="percentage" className="block text-sm font-medium text-gray-300">
                    Percentage (0-100)
                </label>
                <input
                    type="number"
                    id="percentage"
                    name="percentage"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                    Category
                </label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                >
                    {Object.values(SkillCategory).map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
};
