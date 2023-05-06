import httpStatus from "http-status";
import Api from "../../models/api";
import { API_PATH, responseMessage } from "../../constants/common";
import { generateValidationSchema } from "../../utils/parser";
import { attributesTypes } from "../../constants/common";
import { jsonToOpenApi } from "../../utils/json-to-openapi/json-to-openapi";
import { ResourceRelation } from "../../common.interface";
import ApiSaveChangesModel from "../../models/user-api-update-changes";
import { UUID } from "../../utils/misc/index";

export const generate = async (
  payload: any,
  host: string,
  user: string
): Promise<object> => {
  const { data } = payload;
  let urls: { name: string; url: string }[] = [];
  let rawData = payload;
  let schema = {};
  const name = data.name;

  let apiAccesskey;

  for (const resource of data.children) {
    let finalSchema: { type: string; properties: any; required: string[] } = {
      type: attributesTypes.object,
      properties: {},
      required: [],
    };

    if (!resource.children) {
      resource.children = [];
    }

    let relation: ResourceRelation[] = [];

    for (const field of resource.children) {
      const schema = generateValidationSchema(field, relation);
      finalSchema.properties[field.name] = schema[field.name];
      field.required && finalSchema.required.push(field.name);
    }
    schema[resource.name] = {};

    schema[resource.name].schema = finalSchema;
    schema[resource.name].relation = relation;

    // // checkmodel schema
    // if (mongoose.models[name]) {
    //   mongoose.connection.deleteModel(name);
    // }

    urls.push({
      name,
      url: host + API_PATH + "/client/" + data.name + "/" + resource.name,
    });
  }

  // Generate api access key

  // Create json to openapi
  let openApiJson: any;

  const alreadyCreated = await Api.findOne({ id: data.id, user_id: user });
  if (!alreadyCreated) {
    apiAccesskey = UUID();
    openApiJson = await jsonToOpenApi(data, schema, name, apiAccesskey);
    const generatedSchema = new Api({
      name: name,
      resources: schema,
      user_id: user,
      rawData,
      rawOpenApi: JSON.stringify(openApiJson),
      id: data.id,
      apiAccesskey,
    });
    await generatedSchema.save();
    await storeSaveChanges(payload, user);
  } else {
    apiAccesskey = alreadyCreated.apiAccesskey;
    openApiJson = await jsonToOpenApi(data, schema, name, apiAccesskey);
    alreadyCreated.resources = schema;
    alreadyCreated.rawData = rawData;
    alreadyCreated.rawOpenApi = JSON.stringify(openApiJson);
    await alreadyCreated.save();
    await storeSaveChanges(payload, user);
  }

  return { urls, openApiJson, apiAccesskey };
};

export const healthCheck = async (): Promise<string> => {
  return httpStatus[200];
};

/** Function to fetch openApi documentation object from database,
 * based on query string, which is used as search
 * @param query Object, query string used to fetch record in db
 * @returns Object, OpenApi object
 */
export const getOpenApi = async (query: any): Promise<object> => {
  const selection = {
    name: query.name || "Satschel",
    user_id: query.userId, // TODO: will replace this hardcoded value after integration
    isDeleted: false,
  };

  const projection = {
    rawOpenApi: 1,
  };

  const data = await Api.findOne(selection, projection);

  if (!data) {
    return { message: responseMessage[404] };
  }

  return JSON.parse(data.rawOpenApi);
};

/** Fucntion to store saved changes in database
 * @param payload Object, saved changes object
 * @param user String | Number, userId for which saved object to be stored in database
 * @returns Boolean, true if document is stored or updated
 */
export const storeSaveChanges = async (
  payload: any,
  user: string
): Promise<boolean> => {
  const { data } = payload;

  const apiSaveChanges = await ApiSaveChangesModel.findOne({
    id: data.id,
    user_id: user,
  });

  if (!apiSaveChanges) {
    await ApiSaveChangesModel.create({
      id: data.id,
      name: data.name,
      user_id: user,
      saveObject: data,
    });
    return true;
  }

  await ApiSaveChangesModel.findOneAndUpdate(
    { id: data.id, user_id: user },
    { $set: { saveObject: data } },
    { new: true }
  );
  return true;
};

/** Fucntion return all saved changes object based on user id
 *
 * @param user String, unique user id
 * @returns Object, saved changes object
 */
export const getSaveChanges = async (user: string): Promise<object> => {
  const selection = {
    user_id: user,
    isDeleted: false,
  };

  const projection = {
    saveObject: 1,
    id: 1,
  };

  const data = await ApiSaveChangesModel.find(selection, projection);
  if (!data) return { message: responseMessage[404] };
  return data;
};

/** Function to update isDeleted key to true for api and saved changes collection
 *
 * @param user string
 * @param query object
 * @returns boolean
 */
export const deleteApiAndSavedChanges = async (
  user: string | number,
  query: any
): Promise<boolean> => {
  const selection = {
    user_id: user,
    id: parseInt(query.id),
  };

  const updateObj = {
    $set: { isDeleted: true },
  };

  await ApiSaveChangesModel.findOneAndUpdate(selection, updateObj, {
    new: true,
  });

  await Api.findOneAndUpdate(selection, updateObj, { new: true });
  return true;
};
