import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { CredentialsType } from "@/types";
import { UserController } from "@/modules/user/user.controller";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password) {
                    throw new Error('Credentials are not provided or are invalid');
                }

                const { email, password } = credentials as CredentialsType;
                // const { compare } = await import("bcryptjs");
                // const { UserController } = await import("@/modules/user/user.controller");
                const userController = new UserController();
                const user = await userController.getUserByEmail(email);
                if (!user) {
                    throw new Error("Invalid credentials.")
                }

                const isValid = await compare(password, user.password);

                if (!isValid) {
                    throw new Error("Invalid credentials.")
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
                // return null;
            },
        }),
    ],
})