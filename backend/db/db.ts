import mongoose from "mongoose";

const connectDB = () => {
    const fallbackUri = "mongodb://deepakdeveloper16_db_user:8YmITfILL69a3XGt@ac-g0bva66-shard-00-00.uzdyh4u.mongodb.net:27017,ac-g0bva66-shard-00-01.uzdyh4u.mongodb.net:27017,ac-g0bva66-shard-00-02.uzdyh4u.mongodb.net:27017/?ssl=true&replicaSet=atlas-mad53c-shard-0&authSource=admin&appName=Cluster0";
    
    // Get URI and sanitize accidental quotes or spaces that get pasted into Render
    let uri = process.env.MONGO_URI || fallbackUri;
    uri = uri.replace(/^["']|["']$/g, '').trim();

    console.log("Attempting MongoDB connection...");
    
    mongoose.connect(uri, { family: 4 })
        .then(() => console.log("MongoDB connected successfully!"))
        .catch((err) => console.log("DB connection error:", err.message));
}

export default connectDB;