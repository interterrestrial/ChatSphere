import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;
