'use client';
import { useCallback, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { Project } from '@/modules/project/project.entity';
import { createProject, updateProject } from '@/modules/project/project.controller';
import { uploadFile } from '@/modules/file/file.controller';
import { Button } from '@/components/UI/Button';

interface ProjectFormProps {
    initialData?: Project;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ProjectForm = ({ initialData, onSuccess, onCancel }: ProjectFormProps) => {
    const [formData, setFormData] = useSafeState({
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
    const [isLoading, setIsLoading] = useSafeState(false);
    const [isUploadingImage, setIsUploadingImage] = useSafeState(false);
    const imageRef = useRef<HTMLInputElement | null>(null);

    const handleFileUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsUploadingImage(true);
            try {
                const result = await uploadFile(file);
                if (result.success && result.url) {
                    setFormData((prev) => ({ ...prev, imageUrl: result.url }));
                    toast.success('Image uploaded successfully');
                } else {
                    toast.error('Failed to upload image');
                }
            } catch (error) {
                console.error(error);
                toast.error('An error occurred during upload');
            } finally {
                setIsUploadingImage(false);
                if (e.target) e.target.value = '';
            }
        },
        [setFormData, setIsUploadingImage]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'displayOrder' ? Number(value) : value,
            }));
        },
        [setFormData]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
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
        },
        [formData, initialData, onSuccess, setIsLoading]
    );

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
                    rows={6}
                    placeholder="Short summary of the project and notable features"
                />

                <Box>
                    <TextField
                        label="Image URL"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <input type="file" accept="image/*" ref={imageRef} style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploadingImage} />
                        <Button type="button" variant="default" size="sm" onClick={() => imageRef.current?.click()} disabled={isUploadingImage} sx={{ minWidth: 120 }}>
                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        </Button>

                        {formData.imageUrl && (
                            <Box sx={{ width: 64, height: 40, borderRadius: 1, overflow: 'hidden', border: 1, borderColor: 'divider', position: 'relative' }}>
                                <Image src={formData.imageUrl} alt="preview" fill sizes="64px" style={{ objectFit: 'cover' }} />
                            </Box>
                        )}
                    </Box>
                </Box>

                <TextField
                    label="Technologies (comma separated)"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="E.g. React, Next.js, PostgreSQL"
                    placeholder="React, Next.js, PostgreSQL"
                />

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <TextField
                            label="Live URL"
                            name="liveUrl"
                            value={formData.liveUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <TextField
                            label="Source Code URL"
                            name="sourceCodeUrl"
                            value={formData.sourceCodeUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <TextField
                            label="Play Store URL"
                            name="playStoreUrl"
                            value={formData.playStoreUrl}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
                        <TextField
                            label="App Store URL"
                            name="appStoreUrl"
                            value={formData.appStoreUrl}
                            onChange={handleChange}
                            fullWidth
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
                    <Button type="submit" disabled={isLoading} sx={{ minWidth: 160 }}>
                        {isLoading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
                    </Button>
                </Box>
            </Stack>
        </form>
    );
};
