'use client';

import { useState } from 'react';
import { Project } from '@/modules/project/project.entity';
import { createProject, updateProject } from '@/modules/project/project.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';

interface ProjectFormProps {
    initialData?: Project;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ProjectForm = ({ initialData, onSuccess, onCancel }: ProjectFormProps) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        imageUrl: initialData?.imageUrl || '',
        technologies: initialData?.technologies?.join(', ') || '',
        liveUrl: initialData?.liveUrl || '',
        sourceCodeUrl: initialData?.sourceCodeUrl || '',
        playStoreUrl: initialData?.playStoreUrl || '',
        appStoreUrl: initialData?.appStoreUrl || '',
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
            const technologiesArray = formData.technologies
                .split(',')
                .map((tech) => tech.trim())
                .filter((tech) => tech.length > 0);

            const dataToSubmit = {
                ...formData,
                technologies: technologiesArray,
            };

            let result;
            if (initialData) {
                result = await updateProject(initialData.id, { ...dataToSubmit, id: initialData.id });
            } else {
                result = await createProject(dataToSubmit);
            }

            if (result.success) {
                toast.success(`Project ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} project`);
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">
                    Image URL
                </label>
                <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="technologies" className="block text-sm font-medium text-gray-300">
                    Technologies (comma separated)
                </label>
                <input
                    type="text"
                    id="technologies"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-300">
                        Live URL
                    </label>
                    <input
                        type="text"
                        id="liveUrl"
                        name="liveUrl"
                        value={formData.liveUrl}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="sourceCodeUrl" className="block text-sm font-medium text-gray-300">
                        Source Code URL
                    </label>
                    <input
                        type="text"
                        id="sourceCodeUrl"
                        name="sourceCodeUrl"
                        value={formData.sourceCodeUrl}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="playStoreUrl" className="block text-sm font-medium text-gray-300">
                        Play Store URL
                    </label>
                    <input
                        type="text"
                        id="playStoreUrl"
                        name="playStoreUrl"
                        value={formData.playStoreUrl}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-100 shadow-sm focus:border-accent-color focus:ring-accent-color sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="appStoreUrl" className="block text-sm font-medium text-gray-300">
                        App Store URL
                    </label>
                    <input
                        type="text"
                        id="appStoreUrl"
                        name="appStoreUrl"
                        value={formData.appStoreUrl}
                        onChange={handleChange}
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
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
};
