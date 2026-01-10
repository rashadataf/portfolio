'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { Skill, SkillCategory } from '@/modules/skill/skill.entity';
import { createSkill, updateSkill } from '@/modules/skill/skill.controller';
import { Button } from '@/components/UI/Button';

interface SkillFormProps {
    initialData?: Skill;
    onSuccess: () => void;
    onCancel: () => void;
}

export const SkillForm = ({ initialData, onSuccess, onCancel }: SkillFormProps) => {
    const [formData, setFormData] = useSafeState({
        name: initialData?.name || '',
        percentage: initialData?.percentage || 50,
        category: initialData?.category || SkillCategory.Proficient,
        displayOrder: initialData?.displayOrder || 0,
    });
    const [isLoading, setIsLoading] = useSafeState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target as HTMLInputElement;
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'percentage' || name === 'displayOrder' ? Number(value) : value,
            }));
        },
        [setFormData]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setIsLoading(true);
            try {
                let result;
                if (initialData) {
                    result = await updateSkill(initialData.id, formData);
                } else {
                    result = await createSkill(formData);
                }

                if (result.success) {
                    toast.success(`Skill ${initialData ? 'updated' : 'created'} successfully`);
                    onSuccess();
                } else {
                    toast.error(`Failed to ${initialData ? 'update' : 'create'} skill`);
                }
            } catch (error) {
                toast.error('An error occurred');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        },
        [formData, initialData, onSuccess, setIsLoading]
    );

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField
                    label="Skill Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Percentage (0-100)"
                    name="percentage"
                    type="number"
                    slotProps={{ htmlInput: { min: 0, max: 100 } }}
                    value={formData.percentage}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Category"
                    name="category"
                    select
                    value={formData.category}
                    onChange={handleChange}
                    fullWidth
                >
                    {Object.values(SkillCategory).map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Display Order"
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    fullWidth
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
};
