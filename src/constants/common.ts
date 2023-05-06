export const API_PATH = "/v2/apidesigner";
export const attributesTypes = {
  object: "object",
  string: "string",
  number: "number",
  integer: "integer",
  boolean: "boolean",
  array: "array",
  date: "date",
};

export function collectionName(
  apiId: number,
  resource: string,
  user_id: string
) {
  return user_id + "." + apiId + "." + resource;
}

export const CRUD_MAPPING = {
  CREATE: "post",
  READ: "get",
  UPDATE: "put",
  DELETE: "delete",
};

export const responseMessage = {
  200: "OK",
  201: "Created",
  404: "Not found",
};
