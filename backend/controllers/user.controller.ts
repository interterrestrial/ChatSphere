import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import User from '../models/user.model';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const query = req.query.q as string;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Return empty array if logic relies on search terms, but NewChatModal expects a default list too
        const filter: any = { _id: { $ne: userId } };
        
        if (query) {
            const regex = new RegExp(query, 'i');
            filter.$or = [
                { name: regex },
                { username: regex },
                { email: regex }
            ];
        }

        const users = await User.find(filter)
            .select('name email username avatar _id')
            .limit(20)
            .lean();

        // Ensure users have an avatar or a mockup
        const mappedUsers = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            username: u.username,
            avatar: (u as any).avatar || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff`,
            role: 'User'
        }));

        res.status(200).json(mappedUsers);
    } catch (error: any) {
        console.error("Search Users Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
