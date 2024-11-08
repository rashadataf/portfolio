import { UserRepository } from '@/modules/user/user.repository';
import { CreateUserDTO } from '@/modules/user/user.dto';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getUserByEmail(email: string) {
        return this.userRepository.findUserByEmail(email);
    }

    async getAllUsers() {
        return this.userRepository.findAll();
    }

    async createUser(userDTO: CreateUserDTO) {
        return this.userRepository.createUser(userDTO);
    }
}
