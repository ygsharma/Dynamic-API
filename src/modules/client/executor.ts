import httpStatus from "http-status";
import { HttpStatusCode } from "../../constants/httpCode";
import { HttpType, methodMap } from "../../constants/methodMap";
import { logger } from "../logger";
import mongoose from "mongoose";
import { collectionName } from "../../constants/common";
import { ResourceRelation } from "../../common.interface";
import ApiError from "../errors/ApiError";

export const modelExecutor = async (
  Model: mongoose.Collection<any>,
  param: string,
  method: string,
  crud: string[],
  body: any,
  include: boolean,
  relations: ResourceRelation[],
  user: string,
  apiId: number
): Promise<{ data: any; code: HttpStatusCode; err?: string }> => {
  if (crud.indexOf(methodMap[method]) < 0) {
    return { data: null, code: 403, err: httpStatus[403] };
  }
  if (param && method == "GET") {
    try {
      // using native collection instead of model
      // const document = await Model.findById(param);
      const id = new mongoose.Types.ObjectId(param);

      const document = await Model.findOne({ _id: id });
      if (include) {
        document.relations = {};
        for (let item of relations) {
          let collection = mongoose.connection.collection(
            collectionName(apiId, item.ref, user)
          );

          const key = item.key;

          const docs = await collection
            .find({ [key]: document[item.from] })
            .toArray();
          document.relations[item.ref] = docs;
        }
      }
      return { data: document, code: 200 };
    } catch (err) {
      logger.error(err);
      return { data: null, code: 500, err: err.message };
    }
  } else if (param && method == "PUT") {
    try {
      // const document = await Model.findByIdAndUpdate(param, body, {
      //   new: true,
      // });
      const id = new mongoose.Types.ObjectId(param);

      // FETCH relations to validate linked resource
      for (let item of relations) {
        let collection = mongoose.connection.collection(
          collectionName(apiId, item.ref, user)
        );

        const key = item.key;

        if (Object.keys(body).indexOf(item.from)) {
          // schema match
          const doc = await collection.findOne({ [key]: body[item.from] });
          if (!doc)
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Invalid ${item.from} value, Please check!!`
            );
        }
      }

      const document = await Model.findOneAndUpdate(
        { _id: id },
        { $set: body }
      );
      return { data: document.value, code: 200 };
    } catch (err) {
      logger.error(err);
      return { data: null, code: 500, err: err.message };
    }
  } else if (!param && method == "GET") {
    try {
      const documents = await Model.find().toArray();
      return { data: documents, code: 200 };
    } catch (err) {
      logger.error(err);
      return { data: null, code: 500, err: err.message };
    }
  } else if (!param && method == "POST") {
    try {
      // const document = new Model(body);
      for (let item of relations) {
        let collection = mongoose.connection.collection(
          collectionName(apiId, item.ref, user)
        );

        const key = item.key;

        if (Object.keys(body).indexOf(item.from)) {
          const doc = await collection.findOne({ [key]: body[item.from] });
          if (!doc)
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              `Invalid ${item.from} value, Please check!!`
            );
        }
      }
      const document = await Model.insertOne(body);
      // await document.save();
      return { data: { _id: document.insertedId, ...body }, code: 201 };
    } catch (err) {
      logger.error(err);
      return { data: null, code: 500, err: err.message };
    }
  } else if (param && method == "DELETE") {
    try {
      const id = new mongoose.Types.ObjectId(param);
      const document = await Model.findOneAndDelete({ _id: id });
      return { data: document, code: 200 };
    } catch (err) {
      logger.error(err);
      return { data: null, code: 500, err: err.message };
    }
  } else {
    return { data: null, code: 400, err: httpStatus[400] };
  }
};
