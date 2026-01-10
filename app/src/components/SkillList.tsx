'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { Skill } from '@/modules/skill/skill.entity';
import { deleteSkill, importSkillsJson, deleteAllSkills } from '@/modules/skill/skill.controller';
import { Button } from '@/components/UI/Button';
import { Modal } from '@/components/Modal';
import { SkillForm } from '@/components/SkillForm';

interface SkillListProps {
    skills: Skill[];
}

export const SkillList = ({ skills }: SkillListProps) => {
    const [isModalOpen, setIsModalOpen] = useSafeState(false);
    const [selectedSkill, setSelectedSkill] = useSafeState<Skill | undefined>(undefined);
    const [isImporting, setIsImporting] = useSafeState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleEdit = useCallback(
        (skill: Skill) => {
            setSelectedSkill(skill);
            setIsModalOpen(true);
        },
        [setIsModalOpen, setSelectedSkill]
    );

    const handleCreate = useCallback(
        () => {
            setSelectedSkill(undefined);
            setIsModalOpen(true);
        },
        [setIsModalOpen, setSelectedSkill]
    );

    const handleImportClick = useCallback(
        () => {
            fileInputRef.current?.click();
        },
        []
    );

    const handleDeleteAll = useCallback(
        async () => {
            if (
                confirm('Are you sure you want to delete ALL skills? This action cannot be undone.')
            ) {
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
        },
        [router]
    );

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        },
        [router, setIsImporting]
    );

    const handleDelete = useCallback(
        async (id: number) => {
            if (
                confirm('Are you sure you want to delete this skill?')
            ) {
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
        },
        [router]
    );

    const handleSuccess = useCallback(
        () => {
            setIsModalOpen(false);
            router.refresh();
        },
        [router, setIsModalOpen]
    );

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
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleEdit(skill)} color="primary" aria-label="edit" sx={{ ml: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => handleDelete(skill.id)} color="error" aria-label="delete" sx={{ ml: 1 }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
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
