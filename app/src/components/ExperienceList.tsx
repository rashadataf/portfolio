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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

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
        <Box>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Experience</Typography>
                <Stack direction="row" spacing={1}>
                    <Button onClick={handleImportClick} variant="secondary" disabled={isImporting}>
                        <Upload />
                        {isImporting ? 'Importing...' : 'Import JSON'}
                    </Button>
                    <Button onClick={handleDeleteAll} variant="destructive">
                        <Trash />
                        Delete All
                    </Button>
                    <Button onClick={handleCreate} variant="default">
                        <Plus />
                        Add Experience
                    </Button>
                </Stack>
            </Stack>

            <Stack spacing={2}>
                {experiences.map((experience) => (
                    <Paper key={experience.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, flex: 1 }}>
                            <Typography variant="h6">{experience.position}</Typography>
                            <Typography color="text.secondary">{experience.company} - {experience.location}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{experience.startDate} - {experience.endDate}</Typography>

                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                {experience.responsibilities.slice(0, 2).map((resp, idx) => (
                                    <li key={idx}>
                                        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '36rem' }}>{resp}</Typography>
                                    </li>
                                ))}
                                {experience.responsibilities.length > 2 && (
                                    <li>
                                        <Typography variant="caption" color="text.secondary">+{experience.responsibilities.length - 2} more...</Typography>
                                    </li>
                                )}
                            </Box>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleEdit(experience)} aria-label="edit">
                                <Pencil />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(experience.id)} aria-label="delete">
                                <Trash2 />
                            </IconButton>
                        </Stack>
                    </Paper>
                ))}

                {experiences.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No experience entries found. Add one to get started.</Typography>
                    </Paper>
                )}
            </Stack>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>{selectedExperience ? 'Edit Experience' : 'Add Experience'}</Typography>
                    <ExperienceForm
                        initialData={selectedExperience}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Box>
            </Modal>
        </Box>
    );
};
