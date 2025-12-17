'use client';

import { useState } from 'react';
import { Profile } from '@/modules/profile/profile.entity';
import { updateProfile } from '@/modules/profile/profile.controller';
import { uploadFile } from '@/modules/file/file.controller';
import { Button } from '@/components/UI/Button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-2">
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                    Headline
                </label>
                <input
                    type="text"
                    id="headline"
                    name="headline"
                    value={formData.headline || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    placeholder="e.g. Software Engineer"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="bioEn" className="block text-sm font-medium text-gray-700">
                    Bio (English)
                </label>
                <textarea
                    id="bioEn"
                    name="bioEn"
                    value={formData.bioEn || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    placeholder="Your bio in English..."
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="aboutEn" className="block text-sm font-medium text-gray-700">
                    About Me (English)
                </label>
                <textarea
                    id="aboutEn"
                    name="aboutEn"
                    value={formData.aboutEn || ''}
                    onChange={handleChange}
                    rows={6}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    placeholder="Detailed about me text..."
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label htmlFor="happyClients" className="block text-sm font-medium text-gray-700">
                        Happy Clients
                    </label>
                    <input
                        type="number"
                        id="happyClients"
                        name="happyClients"
                        value={formData.happyClients || 0}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="projectsCompleted" className="block text-sm font-medium text-gray-700">
                        Projects Completed
                    </label>
                    <input
                        type="number"
                        id="projectsCompleted"
                        name="projectsCompleted"
                        value={formData.projectsCompleted || 0}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                        Years of Experience
                    </label>
                    <input
                        type="number"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience || 0}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="bioAr" className="block text-sm font-medium text-gray-700">
                    Bio (Arabic)
                </label>
                <textarea
                    id="bioAr"
                    name="bioAr"
                    value={formData.bioAr || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color text-right"
                    placeholder="نبذة عنك بالعربية..."
                    dir="rtl"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                </label>
                <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                    placeholder="email@example.com"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">
                    Resume URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="resumeUrl"
                        name="resumeUrl"
                        value={formData.resumeUrl || ''}
                        onChange={handleChange}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                        placeholder="/resume.pdf or https://..."
                    />
                    <div className="relative">
                        <input
                            type="file"
                            id="resumeUpload"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(e, 'resumeUrl')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploadingResume}
                        />
                        <Button type="button" variant="secondary" disabled={isUploadingResume}>
                            {isUploadingResume ? 'Uploading...' : 'Upload PDF'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="heroImageUrl" className="block text-sm font-medium text-gray-700">
                    Hero Image URL
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        id="heroImageUrl"
                        name="heroImageUrl"
                        value={formData.heroImageUrl || ''}
                        onChange={handleChange}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-accent-color focus:border-accent-color"
                        placeholder="/images/profile.jpg or https://..."
                    />
                    <div className="relative">
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'heroImageUrl')}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploadingImage}
                        />
                        <Button type="button" variant="secondary" disabled={isUploadingImage}>
                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        </Button>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={isLoading || isUploadingResume || isUploadingImage} className="w-full">
                {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    );
};
