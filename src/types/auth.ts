// TypeScript interfaces for authentication

export interface UserMetadata {
    username: string;
    [key: string]: any;
}

export interface AuthFormData {
    email: string;
    password: string;
    username?: string;
}

export interface AuthError {
    message: string;
}

export type AuthMode = 'login' | 'signup';
