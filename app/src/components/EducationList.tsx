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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

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
        <Box>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Education</Typography>
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
                        Add Education
                    </Button>
                </Stack>
            </Stack>

            <Stack spacing={2}>
                {educations.map((education) => (
                    <Paper key={education.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, flex: 1 }}>
                            <Typography variant="h6">{education.institution}</Typography>
                            <Typography color="text.secondary">{education.degree} in {education.field}</Typography>
                            <Typography variant="body2" color="text.secondary">{education.startDate} - {education.endDate}</Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => handleEdit(education)} aria-label="edit">
                                <Pencil />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(education.id)} aria-label="delete">
                                <Trash2 />
                            </IconButton>
                        </Stack>
                    </Paper>
                ))}

                {educations.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No education entries found. Add one to get started.</Typography>
                    </Paper>
                )}
            </Stack>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>{selectedEducation ? 'Edit Education' : 'Add Education'}</Typography>
                    <EducationForm
                        initialData={selectedEducation}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Box>
            </Modal>
        </Box>
    );
};
