import { ProfileRepository } from './profile.repository';
import { type UpdateProfileDTO } from './profile.dto';
import { type Profile } from './profile.entity';

export class ProfileService {
    private repository: ProfileRepository;

    constructor() {
        this.repository = new ProfileRepository();
    }

    async getProfile(slug: string = 'main'): Promise<Profile> {
        const profile = await this.repository.getProfile(slug);
        if (!profile) {
            throw new Error('Profile not found');
        }
        return profile;
    }

    async updateProfile(slug: string, data: UpdateProfileDTO): Promise<Profile> {
        return await this.repository.updateProfile(slug, data);
    }
}
