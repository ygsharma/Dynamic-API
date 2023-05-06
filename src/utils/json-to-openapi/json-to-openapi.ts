import config from "../../config/config";
import { CRUD_MAPPING } from "../../constants/common";
import { responses } from "../../constants/openapi";
import {
  openApiStructurePostAndGet,
  getOpenApiStructureById,
} from "./openapi-json-structure";

/** Function initlizes openApi documentation object
 *
 * @param name String, Client name for url generation
 * @returns Object, Openapi object
 */
function initOpenApiObj(name) {
  const openApiObj = {
    openapi: "3.0.0",
    info: {
      title: "",
      description: "",
      version: "3.0.0",
    },
    tags: [],
    paths: {},
    components: {
      schemas: {},
      responses,
      securitySchemes: {
        apiAccesskey: {
          type: "apiKey",
          name: "x-api-key",
          in: "header",
        },
      },
    },
    servers: [
      {
        url: `${config.openApiUrl}client/${name}`,
      },
    ],
  };
  return openApiObj;
}

/** Function to construct url path for post, update and fetch data
 *  • Path returned by this function is used call api's in Swagger
 * @param path String,
 * @param id Number | Null
 * @returns String, Document Url path
 */
function createPath(path: string, id: number | null): string {
  if (id) return "/" + path + "/{id}";
  return "/" + path;
}

/** Function returns the CRUD value mapped to HTTP methods
 * Like for (post: CREATE, get: READ, put: UPDATE, delete: DELETE)
 * @param methods String, http method
 * @returns String, CRUD operation value mapped to HTTP methods
 */
function getHttpMethod(methods: string[]): object {
  let obj = {};

  for (let v of methods) {
    obj[v] = CRUD_MAPPING[v];
  }

  return obj;
}

/** Function to convert JSON to OpenApi documentation object
 *
 * @param data Object, Data point to be filled in swagger docs
 * @param rawSchema Object,
 * @param apiName String, client name for documentation
 * @param apiAccesskey String, unique api access key
 * @returns Object, Swagger documentation object
 */
export const jsonToOpenApi = (
  data: any,
  rawSchema: any,
  apiName: string,
  apiAccesskey: string
) => {
  // Intialize openapi object
  const openApiObj = initOpenApiObj(apiName);

  const { name, description, label, children } = data;

  openApiObj["info"].title = name;
  openApiObj["info"].description = description;

  for (let obj of children) {
    // Get http crud mapped value
    const httpMethod = getHttpMethod(obj.crud);

    // Construct openApi url path
    const pathKey = createPath(obj.name, null);
    openApiObj["paths"][pathKey] = {};

    if (httpMethod["CREATE"]) {
      // Generate openApi documentation for Post request
      const postObj = openApiStructurePostAndGet(
        obj.name,
        httpMethod["CREATE"],
        apiAccesskey
      );
      openApiObj["paths"][pathKey]["post"] = postObj;
    }

    if (httpMethod["READ"]) {
      // Generate openApi documentation for GET all request
      const getObj = openApiStructurePostAndGet(
        obj.name,
        httpMethod["READ"],
        apiAccesskey
      );
      openApiObj["paths"][pathKey]["get"] = getObj;
    }

    if (httpMethod["UPDATE"]) {
      // Construct openApi url path
      const pathKey = createPath(obj.name, obj.id);

      if (!openApiObj["paths"][pathKey]) {
        openApiObj["paths"][pathKey] = {};
      }

      // Generate openApi documentation for Update request
      const putObj = getOpenApiStructureById(
        obj.name,
        httpMethod["UPDATE"],
        apiAccesskey
      );
      openApiObj["paths"][pathKey]["put"] = putObj;
    }

    if (httpMethod["DELETE"]) {
      // Construct openApi url path
      const pathKey = createPath(obj.name, obj.id);

      if (!openApiObj["paths"][pathKey]) {
        openApiObj["paths"][pathKey] = {};
      }

      // Generate openApi documentation for delete request
      const deleteObj = getOpenApiStructureById(
        obj.name,
        httpMethod["DELETE"],
        apiAccesskey
      );
      openApiObj["paths"][pathKey]["delete"] = deleteObj;
    }

    if (httpMethod["READ"] && obj.id) {
      // Construct openApi url path
      const pathKey = createPath(obj.name, obj.id);

      if (!openApiObj["paths"][pathKey]) {
        openApiObj["paths"][pathKey] = {};
      }

      // Generate openApi documentation for GET by id request
      const getObj = getOpenApiStructureById(
        obj.name,
        httpMethod["READ"],
        apiAccesskey
      );
      openApiObj["paths"][pathKey]["get"] = getObj;
    }
  }

  for (let [key, value] of Object.entries(rawSchema)) {
    openApiObj["components"]["schemas"][key] = value["schema"];
  }

  return openApiObj;
};
