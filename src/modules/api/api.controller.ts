import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import { responseMessage } from "../../constants/common"

import * as apiService from "./api.service";
import { RequestWithUser } from "../../common.interface";
import { responseNormal } from "../../utils/misc/response";

export const generateApi = catchAsync(async (req: RequestWithUser, res: Response) => {
  const api = await apiService.generate(req.body, req.hostname, req.user);
  responseNormal(res, httpStatus.CREATED, responseMessage[201], api);
});

export const healthApi = catchAsync(async (req: Request, res: Response) => {
  const data = await apiService.healthCheck();
  responseNormal(res, httpStatus.OK, responseMessage[200], data);
});

export const getOpenApiJson = catchAsync(async (req: Request, res: Response) => {
  const resp = await apiService.getOpenApi(req.query);
  res.status(httpStatus.OK).json( resp );
})

export const saveChanges = catchAsync(async (req: RequestWithUser, res: Response) => {
  const api = await apiService.storeSaveChanges(req.body, req.user);
  responseNormal(res, httpStatus.OK, responseMessage[200], {});
})

export const fetchSaveChanges = catchAsync(async (req: RequestWithUser, res: Response) => {
  const resp = await apiService.getSaveChanges(req.user);
  responseNormal(res, httpStatus.OK, responseMessage[200], resp);
})

export const deleteApi = catchAsync(async (req: RequestWithUser, res: Response) => {
  await apiService.deleteApiAndSavedChanges(req.user, req.query);
  responseNormal(res, httpStatus.OK, responseMessage[200], {});
})