import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getConversations, getMessages, sendMessage, createConversation, searchUsers, getAllUsers } from "../controllers/chat.controller";

const router = Router();

router.use(requireAuth);

router.get("/users", getAllUsers);
router.get("/users/search", searchUsers);
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.get("/messages/:conversationId", getMessages);
router.post("/messages", sendMessage);

export default router;
