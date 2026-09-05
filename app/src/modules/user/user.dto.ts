import { type Role } from "@/types";

export interface CreateUserDTO {
    email: string;
    password: string;
    role?: Role;
}

export interface UpdateUserDTO {
    email: string;
}
