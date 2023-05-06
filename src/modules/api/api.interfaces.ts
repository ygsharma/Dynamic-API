import mongoose, { Model, Document } from "mongoose";

export interface IApi {
  name: string;
  resources: object;
  rawData: { data: any };
  user_id: string;
  rawOpenApi: string;
  isDeleted: boolean;
  id: number;
  apiAccesskey: string;
}

export interface IApiSaveChanges {
  name: string;
  user_id: string;
  saveObject: object;
  isDeleted: boolean;
  id: number;
}
