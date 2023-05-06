import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import { RequestWithApikey, RequestWithUser } from "../../common.interface";

export const verifyToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const user = req.headers["user"] as string;

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(httpStatus.UNAUTHORIZED).json({ error: httpStatus[401] });
  }
};

export const verifyApiKey = (
  req: RequestWithApikey,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers["x-api-key"] as string;

  if (apiKey) {
    req.apiKey = apiKey;
    next();
  } else {
    res.status(httpStatus.FORBIDDEN).json({ error: httpStatus[403] });
  }
};
