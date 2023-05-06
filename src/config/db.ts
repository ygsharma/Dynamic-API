import mongoose from "mongoose";
import config from "./config";

export async function connect(): Promise<void> {
  try {
    await mongoose.connect(config.mongoose.url);
  } catch (error) {
    throw error;
  }
}
