import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { CredentialsType } from "@/types";

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
                const { compare } = await import("bcryptjs");
                const { UserController } = await import("@/modules/user/user.controller");
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
            },
        }),
    ],
    basePath: process.env.AUTH_BASE_PATH,
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.email) {
                session.user.id = token.id as string;
                session.user.email = token.email;
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user && user.id && user.email) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            return token;
        },
    },
})

export const isAdmin = async () => {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
    }
}