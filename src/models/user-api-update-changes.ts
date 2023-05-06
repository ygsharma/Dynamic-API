import mongoose from "mongoose";
import { IApiSaveChanges } from "../modules/api/api.interfaces";

const apiSaveChangesSchema = new mongoose.Schema<IApiSaveChanges>(
  {
    name: {
      type: String,
      trim: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    saveObject: {
      type: Object
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);

const ApiSaveChangesModel = mongoose.model<IApiSaveChanges>("api-save-changes", apiSaveChangesSchema);
export default ApiSaveChangesModel;
