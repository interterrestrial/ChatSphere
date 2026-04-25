import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const JWT_EXPIRES_IN = "7d"; // 7 days

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET environment variable is required");
    return secret;
};

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, username?: string | null): string => {
    return jwt.sign({ userId, username }, getJwtSecret(), {
        expiresIn: JWT_EXPIRES_IN,
    });
};
