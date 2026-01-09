'use client';

import { useState } from 'react';
import { Experience } from '@/modules/experience/experience.entity';
import { createExperience, updateExperience } from '@/modules/experience/experience.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface ExperienceFormProps {
    initialData?: Experience;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ExperienceForm = ({ initialData, onSuccess, onCancel }: ExperienceFormProps) => {
    const [formData, setFormData] = useState({
        company: initialData?.company || '',
        position: initialData?.position || '',
        location: initialData?.location || '',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        responsibilities: initialData?.responsibilities?.join('\n') || '',
        displayOrder: initialData?.displayOrder || 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'displayOrder' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const responsibilitiesArray = formData.responsibilities
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            const dataToSubmit = {
                ...formData,
                responsibilities: responsibilitiesArray,
            };

            let result;
            if (initialData) {
                result = await updateExperience(initialData.id, dataToSubmit);
            } else {
                result = await createExperience(dataToSubmit);
            }

            if (result.success) {
                toast.success(`Experience ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} experience`);
            }
        } catch (error) {
            toast.error('An error occurred');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '50%', xs: '100%' } }}>
                        <TextField
                            label="Start Date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            fullWidth
                            placeholder="e.g. Dec 2021"
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '50%', xs: '100%' } }}>
                        <TextField
                            label="End Date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            fullWidth
                            placeholder="e.g. Present"
                        />
                    </Box>
                </Stack>

                <TextField
                    label="Responsibilities (one per line)"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    multiline
                    rows={5}
                    fullWidth
                />

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
                        {isLoading ? 'Saving...' : initialData ? 'Update Experience' : 'Create Experience'}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
};
