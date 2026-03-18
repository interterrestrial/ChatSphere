import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI as string;

async function test() {
    try {
        console.log("Connecting...");
        await mongoose.connect(uri);
        console.log("Connected!");
        
        const User = mongoose.model("User", new mongoose.Schema({ name: String }));
        console.log("Finding...");
        const users = await User.find({}).limit(1);
        console.log("Found:", users.length);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
