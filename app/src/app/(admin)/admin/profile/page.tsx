import { getProfile } from '@/modules/profile/profile.controller';
import { ProfileForm } from '@/components/ProfileForm';

export default async function ProfileAdminPage() {
    const { data: profile } = await getProfile();

    if (!profile) {
        return <div>Error loading profile. Please ensure the database is initialized.</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Profile</h1>
            <ProfileForm initialData={profile} />
        </div>
    );
}
