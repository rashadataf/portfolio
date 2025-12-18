'use client';

import { useState, useRef } from 'react';
import { Education } from '@/modules/education/education.entity';
import { deleteEducation, importEducationsJson, deleteAllEducations } from '@/modules/education/education.controller';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/Modal';
import { EducationForm } from '@/components/EducationForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Upload, Trash } from 'lucide-react';

interface EducationListProps {
    educations: Education[];
}

export const EducationList = ({ educations }: EducationListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEducation, setSelectedEducation] = useState<Education | undefined>(undefined);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleEdit = (education: Education) => {
        setSelectedEducation(education);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedEducation(undefined);
        setIsModalOpen(true);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL education entries? This action cannot be undone.')) {
            try {
                const result = await deleteAllEducations();
                if (result.success) {
                    toast.success('All education entries deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete education entries');
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
            const result = await importEducationsJson(formData);
            if (result.success) {
                toast.success('Education imported successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to import education');
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
        if (confirm('Are you sure you want to delete this education entry?')) {
            try {
                const result = await deleteEducation(id);
                if (result.success) {
                    toast.success('Education deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete education');
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
                <h2 className="text-2xl font-bold text-gray-100">Education</h2>
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
                        Add Education
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {educations.map((education) => (
                    <div
                        key={education.id}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex justify-between items-start"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-gray-100">{education.institution}</h3>
                            <p className="text-accent-color">{education.degree} in {education.field}</p>
                            <p className="text-sm text-gray-400">{education.startDate} - {education.endDate}</p>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(education)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(education.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {educations.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
                        No education entries found. Add one to get started.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <div className="p-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-100 mb-4">
                        {selectedEducation ? 'Edit Education' : 'Add Education'}
                    </h3>
                    <EducationForm
                        initialData={selectedEducation}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
};
