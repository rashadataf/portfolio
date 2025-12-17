'use client';

import { useState, useRef } from 'react';
import { Experience } from '@/modules/experience/experience.entity';
import { deleteExperience, importExperiencesJson, deleteAllExperiences } from '@/modules/experience/experience.controller';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/Modal';
import { ExperienceForm } from '@/components/ExperienceForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Upload, Trash } from 'lucide-react';

interface ExperienceListProps {
    experiences: Experience[];
}

export const ExperienceList = ({ experiences }: ExperienceListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] = useState<Experience | undefined>(undefined);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleEdit = (experience: Experience) => {
        setSelectedExperience(experience);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedExperience(undefined);
        setIsModalOpen(true);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL experiences? This action cannot be undone.')) {
            try {
                const result = await deleteAllExperiences();
                if (result.success) {
                    toast.success('All experiences deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete experiences');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred');
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await importExperiencesJson(formData);
            if (result.success) {
                toast.success('Experiences imported successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to import experiences');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during import');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this experience?')) {
            try {
                const result = await deleteExperience(id);
                if (result.success) {
                    toast.success('Experience deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete experience');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred');
            }
        }
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-100">Experience</h2>
                <div className="flex space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <Button onClick={handleImportClick} variant="secondary" disabled={isImporting}>
                        <Upload className="w-4 h-4 mr-2" />
                        {isImporting ? 'Importing...' : 'Import JSON'}
                    </Button>
                    <Button onClick={handleDeleteAll} variant="destructive">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete All
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {experiences.map((experience) => (
                    <div
                        key={experience.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-start"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-gray-100">{experience.position}</h3>
                            <p className="text-accent-color">{experience.company} - {experience.location}</p>
                            <p className="text-sm text-gray-400 mb-2">{experience.startDate} - {experience.endDate}</p>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                {experience.responsibilities.slice(0, 2).map((resp, idx) => (
                                    <li key={idx} className="truncate max-w-md">{resp}</li>
                                ))}
                                {experience.responsibilities.length > 2 && (
                                    <li className="text-gray-500 italic">+{experience.responsibilities.length - 2} more...</li>
                                )}
                            </ul>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(experience)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(experience.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {experiences.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
                        No experience entries found. Add one to get started.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                // title={selectedExperience ? 'Edit Experience' : 'Add Experience'}
            >
                <ExperienceForm
                    initialData={selectedExperience}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
