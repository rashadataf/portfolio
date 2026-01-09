'use client';

import { useState } from 'react';
import { Education } from '@/modules/education/education.entity';
import { createEducation, updateEducation } from '@/modules/education/education.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface EducationFormProps {
    initialData?: Education;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EducationForm = ({ initialData, onSuccess, onCancel }: EducationFormProps) => {
    const [formData, setFormData] = useState({
        institution: initialData?.institution || '',
        degree: initialData?.degree || '',
        field: initialData?.field || '',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        displayOrder: initialData?.displayOrder || 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            let result;
            if (initialData) {
                result = await updateEducation(initialData.id, formData);
            } else {
                result = await createEducation(formData);
            }

            if (result.success) {
                toast.success(`Education ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} education`);
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
                    label="Institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Field of Study"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <TextField
                            label="Start Date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                            fullWidth
                            placeholder="e.g. Sep 2012"
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <TextField
                            label="End Date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            fullWidth
                            placeholder="e.g. Sep 2019"
                        />
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: 140 } }}>
                        <TextField
                            label="Display Order"
                            name="displayOrder"
                            type="number"
                            value={formData.displayOrder}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} sx={{ minWidth: 160 }}>
                        {isLoading ? 'Saving...' : initialData ? 'Update Education' : 'Create Education'}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
};
