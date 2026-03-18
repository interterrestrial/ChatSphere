import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(morgan("dev"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

export default app;
