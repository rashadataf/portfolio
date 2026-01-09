'use client';

import { useState } from 'react';
import { Project } from '@/modules/project/project.entity';
import { createProject, updateProject } from '@/modules/project/project.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

interface ProjectFormProps {
    initialData?: Project;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ProjectForm = ({ initialData, onSuccess, onCancel }: ProjectFormProps) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        imageUrl: initialData?.imageUrl || '',
        technologies: initialData?.technologies?.join(', ') || '',
        liveUrl: initialData?.liveUrl || '',
        sourceCodeUrl: initialData?.sourceCodeUrl || '',
        playStoreUrl: initialData?.playStoreUrl || '',
        appStoreUrl: initialData?.appStoreUrl || '',
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
            const technologiesArray = formData.technologies
                .split(',')
                .map((tech) => tech.trim())
                .filter((tech) => tech.length > 0);

            const dataToSubmit = {
                ...formData,
                technologies: technologiesArray,
            };

            let result;
            if (initialData) {
                result = await updateProject(initialData.id, { ...dataToSubmit, id: initialData.id });
            } else {
                result = await createProject(dataToSubmit);
            }

            if (result.success) {
                toast.success(`Project ${initialData ? 'updated' : 'created'} successfully`);
                onSuccess();
            } else {
                toast.error(`Failed to ${initialData ? 'update' : 'create'} project`);
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
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    rows={4}
                />

                <TextField
                    label="Image URL"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Technologies (comma separated)"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '50%', xs: '100%' } }}>
                        <TextField
                            label="Live URL"
                            name="liveUrl"
                            value={formData.liveUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '50%', xs: '100%' } }}>
                        <TextField
                            label="Source Code URL"
                            name="sourceCodeUrl"
                            value={formData.sourceCodeUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '50%', xs: '100%' } }}>
                        <TextField
                            label="Play Store URL"
                            name="playStoreUrl"
                            value={formData.playStoreUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '50%', xs: '100%' } }}>
                        <TextField
                            label="App Store URL"
                            name="appStoreUrl"
                            value={formData.appStoreUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                </Stack>

                <TextField
                    label="Display Order"
                    name="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    fullWidth
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
};
