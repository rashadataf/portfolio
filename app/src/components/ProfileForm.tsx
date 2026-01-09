'use client';

import { useState, useRef } from 'react';
import { Profile } from '@/modules/profile/profile.entity';
import { updateProfile } from '@/modules/profile/profile.controller';
import { uploadFile } from '@/modules/file/file.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ProfileFormProps {
    initialData: Profile;
}

export const ProfileForm = ({ initialData }: ProfileFormProps) => {
    const [formData, setFormData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'resumeUrl' | 'heroImageUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isResume = field === 'resumeUrl';
        const setUploading = isResume ? setIsUploadingResume : setIsUploadingImage;

        setUploading(true);
        try {
            const result = await uploadFile(file);
            if (result.success && result.url) {
                setFormData((prev) => ({ ...prev, [field]: result.url }));
                toast.success(`${isResume ? 'Resume' : 'Image'} uploaded successfully`);
            } else {
                toast.error(`Failed to upload ${isResume ? 'resume' : 'image'}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await updateProfile(initialData.slug, {
                headline: formData.headline,
                bioEn: formData.bioEn,
                bioAr: formData.bioAr,
                aboutEn: formData.aboutEn,
                happyClients: Number(formData.happyClients),
                projectsCompleted: Number(formData.projectsCompleted),
                yearsOfExperience: Number(formData.yearsOfExperience),
                resumeUrl: formData.resumeUrl,
                contactEmail: formData.contactEmail,
                heroImageUrl: formData.heroImageUrl,
            });

            if (result.success) {
                toast.success('Profile updated successfully');
                router.refresh();
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('An error occurred');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const resumeRef = useRef<HTMLInputElement | null>(null);
    const imageRef = useRef<HTMLInputElement | null>(null);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, bgcolor: 'background.paper', p: 3, borderRadius: 1, boxShadow: 1 }}>
            <Stack spacing={2}>
                <TextField label="Headline" name="headline" value={formData.headline || ''} onChange={handleChange} fullWidth />

                <TextField label="Bio (English)" name="bioEn" value={formData.bioEn || ''} onChange={handleChange} fullWidth multiline rows={4} />

                <TextField label="About Me (English)" name="aboutEn" value={formData.aboutEn || ''} onChange={handleChange} fullWidth multiline rows={6} />

                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '33%', xs: '100%' } }}>
                        <TextField label="Happy Clients" name="happyClients" type="number" value={formData.happyClients || 0} onChange={handleChange} fullWidth />
                    </Box>

                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '33%', xs: '100%' } }}>
                        <TextField label="Projects Completed" name="projectsCompleted" type="number" value={formData.projectsCompleted || 0} onChange={handleChange} fullWidth />
                    </Box>

                    <Box sx={{ flex: '1 1 100%', maxWidth: { md: '33%', xs: '100%' } }}>
                        <TextField label="Years of Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience || 0} onChange={handleChange} fullWidth />
                    </Box>
                </Stack>

                <TextField label="Bio (Arabic)" name="bioAr" value={formData.bioAr || ''} onChange={handleChange} fullWidth multiline rows={4} inputProps={{ dir: 'rtl' }} />

                <TextField label="Contact Email" name="contactEmail" type="email" value={formData.contactEmail || ''} onChange={handleChange} fullWidth />

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Resume URL</Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField label="Resume URL" name="resumeUrl" value={formData.resumeUrl || ''} onChange={handleChange} fullWidth />
                        <input type="file" accept=".pdf" ref={resumeRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'resumeUrl')} disabled={isUploadingResume} />
                        <Button type="button" variant="secondary" onClick={() => resumeRef.current?.click()} disabled={isUploadingResume}>{isUploadingResume ? 'Uploading...' : 'Upload PDF'}</Button>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Hero Image URL</Typography>
                    <Stack direction="row" spacing={1}>
                        <TextField label="Hero Image URL" name="heroImageUrl" value={formData.heroImageUrl || ''} onChange={handleChange} fullWidth />
                        <input type="file" accept="image/*" ref={imageRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'heroImageUrl')} disabled={isUploadingImage} />
                        <Button type="button" variant="secondary" onClick={() => imageRef.current?.click()} disabled={isUploadingImage}>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</Button>
                    </Stack>
                </Box>

                <Button type="submit" disabled={isLoading || isUploadingResume || isUploadingImage} sx={{ width: '100%' }}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </Stack>
        </Box>
    );
};
