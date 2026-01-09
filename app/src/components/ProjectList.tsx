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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

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
        <Box>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".json"
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
                <Button onClick={handleImportClick} variant="secondary" size="sm" disabled={isImporting}>
                    <Upload className="w-4 h-4" />
                    {isImporting ? 'Importing...' : 'Import JSON'}
                </Button>
                <Button onClick={handleDeleteAll} variant="destructive" size="sm">
                    <Trash className="w-4 h-4" />
                    Delete All
                </Button>
                <Button onClick={handleCreate} variant="default" size="sm">
                    <Plus className="w-4 h-4" />
                    Add Project
                </Button>
            </Stack>

            <Stack spacing={2}>
                {projects.map((project) => (
                    <Paper key={project.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ mr: 2, flex: 1 }}>
                            <Typography variant="h6">{project.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{project.description.substring(0, 100)}...</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                {project.technologies.map((tech, index) => (
                                    <Chip key={index} label={tech} size="small" />
                                ))}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleEdit(project)} aria-label="edit">
                                <Pencil />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(project.id)} aria-label="delete">
                                <Trash2 />
                            </IconButton>
                        </Stack>
                    </Paper>
                ))}

                {projects.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No projects found. Click "Add Project" to create one.</Typography>
                    </Paper>
                )}
            </Stack>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>{selectedProject ? 'Edit Project' : 'Add Project'}</Typography>
                <ProjectForm
                    initialData={selectedProject}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </Box>
    );
};
