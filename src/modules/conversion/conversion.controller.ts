
import catchAsync from "../utils/catchAsync";

import { Request, Response } from "express";
import * as conversionService from "./conversion.service";

export const convertToTreeFormat = catchAsync(async (req: Request, res: Response) => {
    const data = await conversionService.getTreeStructure(req);
    res.status(data.code).json({ treeStructure: data.data, message: data.err });
});
