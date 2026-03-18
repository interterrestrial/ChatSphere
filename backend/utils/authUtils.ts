import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_here";
const JWT_EXPIRES_IN = "7d"; // 7 days

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, username?: string | null): string => {
    return jwt.sign({ userId, username }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
