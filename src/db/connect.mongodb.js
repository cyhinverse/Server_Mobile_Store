import mongoose from "mongoose";

const connectDB = async (app) => {
    try {
        const connected = await mongoose.connect(process.env.MONGO_URI);
        if (connected) {
            console.log("MongoDB connected successfully");
            app.listen(process.env.PORT, () => {
                console.log(`Server is running on port ${process.env.PORT}`);
            });
        }
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

export default connectDB;