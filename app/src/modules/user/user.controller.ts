import { UserService } from '@/modules/user/user.service';
import { CreateUserDTO } from '@/modules/user/user.dto';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async createUser(userDTO: CreateUserDTO) {
        const user = await this.userService.createUser(userDTO);
        return user;
    }

    async getUserByEmail(email: string) {
        const isExist = await this.userService.getUserByEmail(email);
        return isExist;
    }

    async getAllUsers() {
        const users = await this.userService.getAllUsers();
        return users;
    }
}
