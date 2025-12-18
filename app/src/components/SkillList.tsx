'use client';

import { useState, useRef } from 'react';
import { Skill } from '@/modules/skill/skill.entity';
import { deleteSkill, importSkillsJson, deleteAllSkills } from '@/modules/skill/skill.controller';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/Modal';
import { SkillForm } from '@/components/SkillForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SkillListProps {
    skills: Skill[];
}

export const SkillList = ({ skills }: SkillListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | undefined>(undefined);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleEdit = (skill: Skill) => {
        setSelectedSkill(skill);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedSkill(undefined);
        setIsModalOpen(true);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL skills? This action cannot be undone.')) {
            try {
                const result = await deleteAllSkills();
                if (result.success) {
                    toast.success('All skills deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete skills');
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
            const result = await importSkillsJson(formData);
            if (result.success) {
                toast.success('Skills imported successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to import skills');
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
        if (confirm('Are you sure you want to delete this skill?')) {
            try {
                const result = await deleteSkill(id);
                if (result.success) {
                    toast.success('Skill deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete skill');
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Skills List</h2>
                <div className="space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <Button onClick={handleImportClick} variant="secondary" disabled={isImporting}>
                        {isImporting ? 'Importing...' : 'Import JSON'}
                    </Button>                    <Button onClick={handleDeleteAll} variant="destructive">
                        Delete All
                    </Button>                    <Button onClick={handleCreate}>Add New Skill</Button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {skills.map((skill) => (
                            <tr key={skill.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{skill.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.percentage}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{skill.displayOrder}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(skill)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(skill.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {skills.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No skills found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-4">
                    <h3 className="text-lg font-medium leading-6 text-primary mb-4">
                        {selectedSkill ? 'Edit Skill' : 'Add New Skill'}
                    </h3>
                    <SkillForm
                        initialData={selectedSkill}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
};
