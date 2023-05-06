// OpenApi header object
const userHeader = {
  name: "x-api-key",
  in: "header",
  required: true,
  description: `The x-api-key in header for Authorization`,
  schema: {
    type: "string",
  },
  example: "123456", // TODO: Need to change with actual userId
};

const includeHeader = {
  name: "include",
  in: "query",
  required: false,
  description: `to include relationships for this resource, use this parameter`,
  schema: {
    type: "boolean",
  },
  example: "true",
};

/** Construct OpenApi documentation object:
 * post api and get all data api:
 * • Returns Array if GET http api is called and,
 * • Returns object of POST http api is called
 * @param resourceName String, Name of the api end point
 * @param method String, Http Method name
 * @param apiAccesskey String, Unique api access key (UUID)
 * @returns Object | Array, OpenApi Documentation obejct for post data and fetch all data
 */
export const openApiStructurePostAndGet = (
  resourceName: string,
  method: string,
  apiAccesskey: string
) => {
  const paylaod = {
    get: {
      summary: `Get all instances of ${resourceName}`,
      tags: [`${resourceName}`],
      parameters: [{ ...userHeader, example: apiAccesskey }],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: `#/components/schemas/${resourceName}`,
                },
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/400",
        },
        "401": {
          $ref: "#/components/responses/401",
        },
        "403": {
          $ref: "#/components/responses/403",
        },
        "500": {
          $ref: "#/components/responses/500",
        },
        "504": {
          $ref: "#/components/responses/504",
        },
      },
    },
    post: {
      summary: `Create a new instance of ${resourceName}`,
      tags: [`${resourceName}`],
      parameters: [{ ...userHeader, example: apiAccesskey }],
      requestBody: {
        required: true,
        description: `${resourceName} content`,
        content: {
          "application/json": {
            schema: {
              $ref: `#/components/schemas/${resourceName}`,
            },
          },
        },
      },
      responses: {
        "201": {
          description: "The resource has been created",
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${resourceName}`,
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/400",
        },
        "401": {
          $ref: "#/components/responses/401",
        },
        "403": {
          $ref: "#/components/responses/403",
        },
        "500": {
          $ref: "#/components/responses/500",
        },
        "504": {
          $ref: "#/components/responses/504",
        },
      },
    },
  };

  return paylaod[method];
};

/** Construct OpenApi object:
 * • Fetching record by Id,
 * • Update record by id
 * • Delete record by id
 *
 * @param resourceName String, Name of the api end point
 * @param method String, Http Method name
 * @param apiAccesskey String, Unique api access key (UUID)
 * @returns Object, OpenApi Documentation obejct for get record by id,
 *                  update record and delete record
 */
export const getOpenApiStructureById = (
  resourceName: string,
  method: string,
  apiAccesskey: string
) => {
  const payload = {
    get: {
      summary: `Retrieve the specified instance of ${resourceName} by id`,
      tags: [`${resourceName}`],
      parameters: [
        {
          in: "path",
          name: "id",
          description: `id of the ${resourceName}`,
          required: true,
          schema: {
            type: "string",
          },
        },
        { ...userHeader, example: apiAccesskey },
        includeHeader,
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${resourceName}`,
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/400",
        },
        "401": {
          $ref: "#/components/responses/401",
        },
        "403": {
          $ref: "#/components/responses/403",
        },
        "500": {
          $ref: "#/components/responses/500",
        },
        "504": {
          $ref: "#/components/responses/504",
        },
      },
    },
    delete: {
      summary: `Delete the specified instance of ${resourceName} by id`,
      tags: [`${resourceName}`],
      parameters: [
        {
          in: "path",
          name: "id",
          description: `id of the ${resourceName}`,
          required: true,
          schema: {
            type: "string",
          },
        },
        { ...userHeader, example: apiAccesskey },
      ],
      responses: {
        "204": {
          description: "The resource has been removed",
        },
        "400": {
          $ref: "#/components/responses/400",
        },
        "401": {
          $ref: "#/components/responses/401",
        },
        "403": {
          $ref: "#/components/responses/403",
        },
        "500": {
          $ref: "#/components/responses/500",
        },
        "504": {
          $ref: "#/components/responses/504",
        },
      },
    },
    put: {
      summary: `Update the specified instance of ${resourceName} by id`,
      tags: [`${resourceName}`],
      parameters: [
        {
          in: "path",
          name: "id",
          description: `id of the ${resourceName}`,
          required: true,
          schema: {
            type: "string",
          },
        },
        { ...userHeader, example: apiAccesskey },
      ],
      requestBody: {
        required: true,
        description: `${resourceName} content`,
        content: {
          "application/json": {
            schema: {
              $ref: `#/components/schemas/${resourceName}`,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${resourceName}`,
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/400",
        },
        "401": {
          $ref: "#/components/responses/401",
        },
        "403": {
          $ref: "#/components/responses/403",
        },
        "500": {
          $ref: "#/components/responses/500",
        },
        "504": {
          $ref: "#/components/responses/504",
        },
      },
    },
  };

  return payload[method];
};
