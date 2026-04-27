import { Request, Response } from 'express';
import User from '../models/user.model';
import { hashPassword, comparePasswords, generateToken } from '../utils/authUtils';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, username } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ message: "Name, email, and password are required" });
            return;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: "Email is already registered" });
            return;
        }

        // If username provided, check availability
        let finalUsername: string | undefined;
        let isUsernameSet = false;
        if (username && username.trim().length >= 3) {
            const lowercasedUsername = username.toLowerCase().trim();
            const existingUsername = await User.findOne({ username: lowercasedUsername });
            if (existingUsername) {
                res.status(409).json({ message: "Username is already taken" });
                return;
            }
            finalUsername = lowercasedUsername;
            isUsernameSet = true;
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            username: finalUsername,
            isUsernameSet,
        });

        const token = generateToken(newUser._id.toString(), newUser.username);
        res.status(201).json({ 
            message: isUsernameSet ? "Registration successful." : "Registration successful. Please choose a username next.", 
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                isUsernameSet: newUser.isUsernameSet,
            }
        });
    } catch (error: any) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, password } = req.body; // identifier can be email or username

        if (!identifier || !password) {
            res.status(400).json({ message: "Email/Username and password are required" });
            return;
        }

        // Find user by either email or username
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        });

        if (!user || !user.password) {
            // Error out if user has no password (they registered via Google)
            res.status(401).json({ message: "Invalid credentials or user registered via Google." });
            return;
        }

        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }

        const token = generateToken(user._id.toString(), user.username);
        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                isUsernameSet: user.isUsernameSet,
            }
        });
    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.body; // Google access token from the frontend

        if (!token) {
            res.status(400).json({ message: "Google token is required" });
            return;
        }

        // Fetch user profile using access token
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const payload = googleResponse.data;
        if (!payload) {
            res.status(400).json({ message: "Invalid Google token payload." });
            return;
        }

        const { sub: googleId, email, name } = payload;

        if (!email || !name) {
             res.status(400).json({ message: "Incomplete user information from Google." });
             return;
        }

        // Check if user exists by googleId
        let user = await User.findOne({ googleId });
        let isNewUser = false;

        if (!user) {
            // Check if user exists by email but without googleId (registered with email/password first)
            user = await User.findOne({ email });

            if (user) {
                // Link account with Google
                user.googleId = googleId;
                await user.save();
            } else {
                // Create new user via Google
                user = await User.create({
                    name,
                    email,
                    googleId,
                });
                isNewUser = true;
            }
        }

        const jwtToken = generateToken(user._id.toString(), user.username);
        
        res.status(200).json({ 
            message: isNewUser ? "Google registration successful. Please choose a username." : "Google login successful", 
            token: jwtToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                isUsernameSet: user.isUsernameSet,
            }
        });

    } catch (error: any) {
         console.error("Google Auth Error:", error);
         // If token is invalid, google library throws specific errors we might catch
         res.status(401).json({ message: "Google authentication failed", error: error.message });
    }
};

export const chooseUsername = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const { username } = authReq.body;
        const userId = authReq.user?.userId;

        if (!username) {
            res.status(400).json({ message: "Username is required." });
            return;
        }

        // Username constraints (basic validation)
        if (username.length < 3 || username.length > 20) {
            res.status(400).json({ message: "Username must be between 3 and 20 characters." });
            return;
        }

        const lowercasedUsername = username.toLowerCase();

        // Check if username is already taken by someone else
        const existingUsername = await User.findOne({ username: lowercasedUsername });
        if (existingUsername && existingUsername._id.toString() !== userId) {
            res.status(409).json({ message: "Username is already taken" });
            return;
        }

        // Update current user
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { username: lowercasedUsername, isUsernameSet: true }, 
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Generate a new token with the username inside
        const token = generateToken(updatedUser._id.toString(), updatedUser.username);

        res.status(200).json({ 
            message: "Username successfully set",
            token,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                isUsernameSet: updatedUser.isUsernameSet,
            }
        });
    } catch (error: any) {
        console.error("Choose Username Error:", error);
        res.status(500).json({ message: error.message || "Failed to set username" });
    }
};
