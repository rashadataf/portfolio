'use client';

import { useState, useRef } from 'react';
import { Project } from '@/modules/project/project.entity';
import { deleteProject, deleteAllProjects, importProjectsJson } from '@/modules/project/project.controller';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/Modal';
import { ProjectForm } from '@/components/ProjectForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Trash, Upload } from 'lucide-react';

interface ProjectListProps {
    projects: Project[];
}

export const ProjectList = ({ projects }: ProjectListProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedProject(undefined);
        setIsModalOpen(true);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await importProjectsJson(formData);
            if (result.success) {
                toast.success('Projects imported successfully');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to import projects');
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

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL projects? This action cannot be undone.')) {
            try {
                const result = await deleteAllProjects();
                if (result.success) {
                    toast.success('All projects deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete projects');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                const result = await deleteProject(id);
                if (result.success) {
                    toast.success('Project deleted successfully');
                    router.refresh();
                } else {
                    toast.error('Failed to delete project');
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
            <div className="flex justify-end mb-6 space-x-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".json"
                />
                <Button onClick={handleImportClick} variant="secondary" className="flex items-center gap-2" disabled={isImporting}>
                    <Upload className="w-4 h-4" />
                    {isImporting ? 'Importing...' : 'Import JSON'}
                </Button>
                <Button onClick={handleDeleteAll} variant="destructive" className="flex items-center gap-2">
                    <Trash className="w-4 h-4" />
                    Delete All
                </Button>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Project
                </Button>
            </div>

            <div className="grid gap-4">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center"
                    >
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100">{project.title}</h3>
                            <p className="text-gray-400">{project.description.substring(0, 100)}...</p>
                            <div className="flex gap-2 mt-2">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(project)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(project.id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No projects found. Click &quot;Add Project&quot; to create one.
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-100">{selectedProject ? 'Edit Project' : 'Add Project'}</h2>
                <ProjectForm
                    initialData={selectedProject}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};
