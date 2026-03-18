import mongoose from "mongoose";

const connectDB = () => {
    console.log("Connecting to MongoDB URI:", process.env.MONGO_URI ? "Found" : "Missing");
    mongoose.connect(process.env.MONGO_URI as string)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.log("DB connection error:", err));
}

export default connectDB;