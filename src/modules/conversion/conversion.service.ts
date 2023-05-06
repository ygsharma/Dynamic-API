import httpStatus from "http-status";
import { Request } from "express";
import { HttpStatusCode } from "../../constants/httpCode";
import { transpile } from "postman2openapi";
import yaml from "js-yaml";
import { logger } from "../logger";

type DefaultNodeStructureType = {
  id: number;
  parent: number;
  name: string;
  branchColor: string;
  legendId: string;
  direction: string;
  description: string;
  inDocumentation: boolean;
  children: [];
  type: string;
  example: string;
  queryable: boolean;
  pageable: boolean;
  queryParams: [];
  crud: [];
  enumValues: [];
  searchEnabled: boolean;
  patchEnabled: boolean;
  visibility: string;
  required: boolean;
  xDescription: "";
  abstract: boolean;
  isArray: boolean;
  isSubPath: boolean;
};

//This is a utility function which is being used to generate a unique random id
function getRandomID() {
  return Math.floor(Date.now() * Math.random());
}

//This is a utility function which is being used to generate default node structure
function getDefaultNodeStructure() {
  const defaultStructure: DefaultNodeStructureType = {
    id: 0,
    parent: 0,
    name: "",
    branchColor: "#FCB900",
    legendId: "default",
    direction: "right",
    description: "",
    inDocumentation: true,
    children: [],
    type: "integer",
    example: "1",
    queryable: false,
    pageable: false,
    queryParams: [],
    crud: [],
    enumValues: [],
    searchEnabled: false,
    patchEnabled: false,
    visibility: "READ_WRITE",
    required: false,
    xDescription: "",
    abstract: false,
    isArray: false,
    isSubPath: false,
  };
  return defaultStructure;
}

//This is a utility function which is being used to map data values to default node structure keys.
function mapValues(
  id: number,
  parentID: number,
  propertyName: string,
  propertyValue: any,
  isArray: boolean,
  type: string
): DefaultNodeStructureType {
  const defaultStructure: DefaultNodeStructureType = getDefaultNodeStructure();
  defaultStructure.id = id;
  defaultStructure.parent = parentID;
  defaultStructure.name = propertyName;
  defaultStructure.isArray = isArray;
  defaultStructure.type = type;
  defaultStructure.example = (propertyValue as any).example;
  defaultStructure.enumValues = (propertyValue as any).enum;
  return defaultStructure;
}

//This function converts schema inside openapi json specs to node structure.
function addSchemaValues(
  parentID: number,
  propertyName: string,
  propertyValue: any,
  output: DefaultNodeStructureType[]
) {
  const id = getRandomID();
  let isArray: boolean = false;
  let type: string = "string";
  if (propertyValue.type === "object") {
    for (const [nestedProperty, value] of Object.entries(
      propertyValue.properties
    )) {
      type = (value as any).type;
      if (["object", "array"].includes(type)) {
        addSchemaValues(id, nestedProperty, value, output);
        continue;
      }
      output.push(
        mapValues(getRandomID(), id, nestedProperty, value, isArray, type)
      );
    }
    type = "object";
  } else if (propertyValue.type === "array") {
    isArray = true;
    type = "object";
    for (const [element, value] of Object.entries(
      propertyValue?.items?.properties ?? {}
    )) {
      addSchemaValues(id, element, value ?? {}, output);
      continue;
    }
  }
  output.push(
    mapValues(id, parentID, propertyName, propertyValue, isArray, type)
  );
  return output;
}

//This function convert openapi json specs to array of objects (intermediate structure). BuildTree will use this structure to generate required tree structure
function openApiToTree(openApiJson: any) {
  const parentIds: any = {};
  const output = [];
  const checkedIDs: string[] = [];
  const checkedRequestSchemas: string[] = [];
  const crudOperations: any = {};
  const crudMethods: any = {
    GET: "READ",
    POST: "CREATE",
    PUT: "UPDATE",
    DELETE: "DELETE",
  };
  for (let [index, value] of Object.entries(openApiJson?.paths ?? {})) {
    const endpoints = index.split("/").filter((endpoint) => {
      if (!endpoint.includes("{")) return endpoint;
    });
    const endpoint = endpoints[endpoints.length - 1];
    const crud = Object.keys(value as any).map(
      (method) => crudMethods[method.toUpperCase()]
    );
    const parents = endpoints.length > 1 ? endpoints.slice(0, -1) : null;
    const parent: string =
      parents?.[parents.length - 1].replace(/[^a-zA-Z0-9]/g, "") ?? "";
    //TODO: make dynamic schema selector
    const requestSchema =
      (value as any)?.post?.requestBody?.content?.["application/json"]
        ?.schema?.["$ref"] ?? "";
    if (crudOperations.hasOwnProperty(endpoint.replace(/[^a-zA-Z0-9]/g, ""))) {
      crudOperations[endpoint.replace(/[^a-zA-Z0-9]/g, "")].push(
        ...new Set(crud)
      );
    } else {
      crudOperations[endpoint.replace(/[^a-zA-Z0-9]/g, "")] = [
        ...new Set(crud),
      ];
    }
    if (!crud.includes("CREATE")) {
      if (crudOperations.hasOwnProperty(parent)) {
        crudOperations[parent].push(...crud);
      }
      continue;
    }
    const resource = mapValues(
      getRandomID(),
      parentIds.hasOwnProperty(parent) ? parentIds?.[parent] : null,
      endpoint,
      value,
      true,
      "object"
    );
    // resource.crud = crudOperations[endpoint.replace(/[^a-zA-Z0-9]/g, '')];
    resource.crud = crudOperations[endpoint];
    resource.isSubPath = true;
    if (!checkedIDs.includes(resource.name)) {
      checkedIDs.push(resource.name);
      output.push(resource);
      parentIds[resource.name.replace(/[^a-zA-Z0-9]/g, "")] = resource.id;
    }

    if (requestSchema && !checkedRequestSchemas.includes(requestSchema)) {
      const schemaPieces = requestSchema.split("/");
      const schemaKey = schemaPieces[schemaPieces.length - 1];
      const schemaValue =
        openApiJson?.components?.schemas[schemaKey]?.properties ?? {};
      const checkedAttribute: string[] = [];
      if (Object.keys(schemaValue).length > 0) {
        for (const [attribute, value] of Object.entries(schemaValue)) {
          if (!checkedAttribute.includes(attribute)) {
            addSchemaValues(
              parentIds[resource.name.replace(/[^a-zA-Z0-9]/g, "")],
              attribute,
              value,
              output
            );
          }
        }
      }
      checkedRequestSchemas.push(requestSchema);
    } else {
      const schema = (value as any)?.post?.requestBody?.content?.[
        "application/json"
      ]?.schema?.properties;
      const checkedAttribute: string[] = [];
      if (Object.keys(schema)?.length > 0) {
        for (const [attribute, value] of Object.entries(schema)) {
          if (!checkedAttribute.includes(attribute)) {
            addSchemaValues(
              parentIds[resource.name.replace(/[^a-zA-Z0-9]/g, "")],
              attribute,
              value,
              output
            );
          }
        }
      }
      checkedRequestSchemas.push(requestSchema);
    }
  }
  return output;
}

//This function will convert postman json collection to open api json specs
async function postmanToOpenApi(data: any) {
  try {
    const doc = await transpile(data);
    return doc;
  } catch (err) {
    logger.log(err);
  }
}

//This function generates tree structure from openapi json specs which frontend will use to display tree of resources and attributes
function buildTree(openapiJson: any) {
  const nodes = openApiToTree(openapiJson);
  // const nodes = openapiJson;
  const tree = [];

  // create a map of nodes for fast lookup
  const nodeMap = {};
  nodes.forEach((node) => {
    node.children = [];
    nodeMap[node.id] = node;
  });

  // add each node to its parent's child list
  nodes.forEach((node) => {
    const parent = nodeMap[node.parent];
    if (parent) {
      parent.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
}

export const validateFile = async (fileData: any, fileMetadata: any) => {
  //TODO: write file format and schema validations
  let isValid: boolean = false;
  let fileFormat: string = "other";
  let parsedYamlFileData: any = "";
  let parsedFileType: any = "";
  const fileNameArray = fileMetadata?.name?.split(".");
  const ext = fileNameArray[fileNameArray.length - 1];

  if (["yml", "yaml"].includes(ext)) {
    parsedYamlFileData = yaml.load(fileData);
    parsedFileType = ext;
  }
  if (
    !["yml", "yaml"].includes(ext) &&
    !fileMetadata?.type?.includes("application/json")
  ) {
    return [false, "other", "", "Invalid file format"];
  }
  if (!parsedYamlFileData && typeof fileData === "string") {
    const parsedFileData = JSON.parse(fileData);
    if (Object.keys(parsedFileData).includes("openapi")) {
      isValid = true;
      return [isValid, "openapi", parsedFileData, "File uploaded successfully"];
    } else if (Object.keys(parsedFileData.info).includes("_postman_id")) {
      isValid = true;
      fileFormat = "postman";
      return [isValid, "postman", parsedFileData, "File uploaded successfully"];
    }
  } else {
    isValid = true;
    return [
      isValid,
      "openapi",
      parsedYamlFileData,
      "File uploaded successfully",
    ];
  }
  return [isValid, fileFormat, "", "Invalid file format"];
};

export const getTreeStructure = async (
  req: Request
): Promise<{
  data: any;
  code: HttpStatusCode;
  err?: string | undefined;
}> => {
  try {
    const fileData = req.body?.data;
    const fileMetadata = req.body?.fileMetadata;
    const [isValid, fileFormat, validatedFileData, notificationMessage] =
      await validateFile(fileData, fileMetadata);

    let treeStructure: any = {};
    if (!isValid) {
      return {
        data: treeStructure,
        code: 400,
        err: httpStatus[400],
      };
    } else {
      switch (fileFormat) {
        case "openapi":
          treeStructure = buildTree(validatedFileData);
          break;
        case "postman":
          treeStructure = buildTree(await postmanToOpenApi(validatedFileData));
          break;
        case "default":
          treeStructure = [];
      }
      return {
        data: treeStructure,
        code: 200,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      data: [],
      code: 500,
      err: httpStatus[500],
    };
  }
};
