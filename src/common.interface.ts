import { Request as ExpressRequest } from "express";

export interface RequestWithUser extends ExpressRequest {
  user: string;
}

export interface RequestWithApikey extends ExpressRequest {
  apiKey: string;
}

export interface ResourceRelation {
  key: string;
  ref: string;
  from: string;
}
