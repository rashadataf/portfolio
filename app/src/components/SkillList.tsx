'use client';

import { useState, useRef } from 'react';
import { Skill } from '@/modules/skill/skill.entity';
import { deleteSkill, importSkillsJson, deleteAllSkills } from '@/modules/skill/skill.controller';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/Modal';
import { SkillForm } from '@/components/SkillForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';

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
        <Box>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">Skills List</Typography>
                <Stack direction="row" spacing={1}>
                    <Button onClick={handleImportClick} variant="secondary" disabled={isImporting}>
                        {isImporting ? 'Importing...' : 'Import JSON'}
                    </Button>
                    <Button onClick={handleDeleteAll} variant="destructive">Delete All</Button>
                    <Button onClick={handleCreate}>Add New Skill</Button>
                </Stack>
            </Stack>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Percentage</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {skills.map((skill) => (
                            <TableRow key={skill.id} hover>
                                <TableCell>{skill.name}</TableCell>
                                <TableCell>{skill.category}</TableCell>
                                <TableCell>{skill.percentage}%</TableCell>
                                <TableCell>{skill.displayOrder}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleEdit(skill)} aria-label="edit">Edit</IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(skill.id)} aria-label="delete">Delete</IconButton>
                                </TableCell>
                            </TableRow>
                        ))}

                        {skills.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No skills found. Add one to get started.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>{selectedSkill ? 'Edit Skill' : 'Add New Skill'}</Typography>
                    <SkillForm
                        initialData={selectedSkill}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Box>
            </Modal>
        </Box>
    );
};
