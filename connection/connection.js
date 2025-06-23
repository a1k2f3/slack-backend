import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
const Connection = async () => {
  try {
    const dbUrl = process.env.DATA_BASE_URL; // Use environment variable for the connection string
    await mongoose.connect(dbUrl, {
      dbName: "skyrides", // Specify the database name
      // useNewUrlParser: true, // This is still valid
    });    
let data=await mongoose.connection.db.collection("Accounts").find({}).toArray()
console.log(data)
console.log("Database connection successful");
return data;
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
};
export default Connection;
