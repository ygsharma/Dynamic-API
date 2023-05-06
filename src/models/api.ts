import mongoose from "mongoose";
import { IApi } from "../modules/api/api.interfaces";

const apiSchema = new mongoose.Schema<IApi>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    rawData: {
      type: Object,
      required: true,
    },
    resources: {
      type: Object,
      required: true,
    },
    rawOpenApi: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    id: {
      type: Number,
      required: true,
    },
    apiAccesskey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Api = mongoose.model<IApi>("Api", apiSchema);

export default Api;
