import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		const connected = await mongoose.connect(process.env.MONGO_URI, {
			maxPoolSize: 50,
			minPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
			family: 4,
		});
		if (connected) {
			console.log('MongoDB connected successfully');
		}
	} catch (error) {
		console.error('MongoDB connection failed:', error);
		process.exit(1);
	}
};

export default connectDB;
