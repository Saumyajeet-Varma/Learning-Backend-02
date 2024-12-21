import mongoose from "mongoose"

// Function to connect DB
const connectDB = async () => {

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(`MongoDB connected !! HOST: ${connectionInstance.connection.host}`);
    }
    catch (error) {
        console.error("MONGODB CONNECTION FAILED: ", error);
        process.exit(1);
    }
}

export default connectDB