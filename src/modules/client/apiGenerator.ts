import { Schema, Model } from "mongoose";

// import { router } from "../app";
const mongoose = require("mongoose");
export function generateApi(entityName: string, entitySchema: any): Model<any> {
  if (mongoose.models[entityName]) {
    return mongoose.model(entityName);
  } else {
    const Model = mongoose.model(entityName, entitySchema);
    return Model;
  }
}
