import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

console.log("URI length:", process.env.MONGO_URI?.length);
mongoose.connect(process.env.MONGO_URI as string, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("Connected locally successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Local connection error:", err.message);
        process.exit(1);
    });
