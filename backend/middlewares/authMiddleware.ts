import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_here";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        username?: string;
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    const authHeader = authReq.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authentication required. Please log in." });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username?: string };
        authReq.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token. Please log in again." });
        return;
    }
};
