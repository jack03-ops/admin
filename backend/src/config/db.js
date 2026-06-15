import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/phoenix_gym';
    console.log(`[Database] Attempting connection to MongoDB at ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Connection failed to default MongoDB: ${error.message}`);
    console.log('[Database] Starting in-memory MongoDB Server fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`[Database] In-memory MongoDB Server running at ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`[Database] MongoDB Connected to In-Memory DB: ${conn.connection.host}`);
    } catch (innerError) {
      console.error(`[Database Error] Memory Server failed: ${innerError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
