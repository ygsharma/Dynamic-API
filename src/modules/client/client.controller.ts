import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";

import * as clientService from "./client.service";
import { RequestWithApikey, RequestWithUser } from "../../common.interface";

export const clientApi = catchAsync(
  async (req: RequestWithApikey, res: Response) => {
    const data = await clientService.getData(req);
    if (data.code == httpStatus.OK || data.code == httpStatus.CREATED) {
      res
        .status(httpStatus.OK)
        .json({ data: data.data, message: httpStatus[data.code] });
    } else {
      res.status(data.code).json({ data: data.data, message: data.err });
    }
  }
);
