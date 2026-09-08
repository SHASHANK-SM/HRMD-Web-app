import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export const connectDB = async (uri) => {
  if (!uri && process.env.MONGO_URI) {
    uri = process.env.MONGO_URI;
  }

  if (!uri) {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: "hrms",
      },
    });

    uri = memoryServer.getUri();
    console.log("Using in-memory MongoDB for local demo runtime");
  }

  mongoose.connection.on("connected", () =>
    console.log(`MongoDB connected: ${mongoose.connection.name}`),
  );
  mongoose.connection.on("error", (error) =>
    console.error("MongoDB error:", error),
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("MongoDB disconnected"),
  );

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }

    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: "hrms",
        },
      });
      uri = memoryServer.getUri();
      console.log(
        "Primary MongoDB connection failed. Falling back to in-memory MongoDB for local demo runtime",
      );
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      return mongoose.connection;
    }

    throw error;
  }

  return mongoose.connection;
};

export const stopMemoryDB = async () => {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
