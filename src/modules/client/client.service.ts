import httpStatus from "http-status";
import mongoose, { Schema } from "mongoose";
import Api from "../../models/api";
import ApiError from "../errors/ApiError";
import { generateObject, generateValidationSchema } from "../../utils/parser";
import { Request } from "express";
import { generateApi } from "./apiGenerator";
import { modelExecutor } from "./executor";
import { HttpStatusCode } from "../../constants/httpCode";

import Ajv from "ajv";
import AjvFormats from "ajv-formats";
import { collectionName } from "../../constants/common";
import {
  RequestWithApikey,
  RequestWithUser,
  ResourceRelation,
} from "../../common.interface";

export const getData = async (
  req: RequestWithApikey
): Promise<{
  data: any;
  code: HttpStatusCode;
  err?: string | undefined;
}> => {
  const path1 = req.originalUrl.split("/client/")[1].split("/");
  const apiName = path1[0];

  const include = req.query.include == "true" || false;

  const entity = path1[1];
  const name = entity;

  const schema = await Api.findOne({
    name: apiName,
    apiAccesskey: req.apiKey,
  });

  if (!schema) throw new ApiError(httpStatus.BAD_REQUEST, httpStatus[400]);
  const apiId = schema.id;

  const obj = schema.rawData?.data?.children?.find((w) => w.name == entity);
  if (!obj) throw new ApiError(httpStatus.BAD_REQUEST, httpStatus[400]);

  const finalSchema: { schema: any; relation: ResourceRelation[] } =
    schema.resources[entity];

  if (!finalSchema) throw new ApiError(httpStatus.BAD_REQUEST, httpStatus[400]);
  const relations: { key: string; ref: string; from: string }[] =
    finalSchema.relation;

  if (req.method == "POST" || req.method == "PUT") {
    const ajv = new Ajv();
    AjvFormats(ajv);
    const validate = ajv.compile(finalSchema.schema);
    const result = validate(req.body);

    if (!result) {
      let errorMsg = "";
      validate.errors.forEach((error) => {
        errorMsg += `${error.instancePath.slice(1)} ${error.message}`;
      });
      throw new ApiError(httpStatus.BAD_REQUEST, errorMsg);
    }
  }

  const collection = mongoose.connection.collection(
    collectionName(apiId, name, schema.user_id)
  );

  // TODO: remove model once its usecase is invalidaed, currently switching to native collection
  // const Model = existingmodel
  //   ? mongoose.model(apiName + "." + name)
  //   : generateApi(apiName + "." + name, finalSchema);

  const param = path1[2] ? path1[2].split("?")[0] : undefined;
  const data = await modelExecutor(
    collection,
    param,
    req.method,
    obj.crud || [],
    req.body,
    include,
    relations,
    schema.user_id,
    apiId
  );
  return data;
};
