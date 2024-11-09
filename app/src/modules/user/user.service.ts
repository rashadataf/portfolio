import { hash } from 'bcryptjs';
import { Role } from '@/types';
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
        const hashedPassword = await hash(userDTO.password, 10);
        const role = userDTO.role || Role.User;
        return this.userRepository.createUser({ ...userDTO, password: hashedPassword, role });
    }
}
