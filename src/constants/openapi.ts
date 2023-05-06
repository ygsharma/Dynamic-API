export const responses = {
  "400": {
    "description": "Bad Request",
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "errorCode": {
              "type": "string",
              "enum": [
                "BAD_REQUEST"
              ]
            },
            "errorDescription": {
              "type": "string",
              "example": "Bad request in body/params/headers"
            }
          }
        }
      }
    }
  },
  "401": {
    "description": "Unauthorized",
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "errorCode": {
              "type": "string",
              "enum": [
                "UNAUTHORIZED"
              ]
            },
            "errorDescription": {
              "type": "string",
              "example": "Authentication error"
            }
          }
        }
      }
    }
  },
  "403": {
    "description": "Forbidden",
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "errorCode": {
              "type": "string",
              "enum": [
                "FORBIDDEN"
              ]
            },
            "errorDescription": {
              "type": "string",
              "example": "You cannot access this resource"
            }
          }
        }
      }
    }
  },
  "404": {
    "description": "Not Found",
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "errorCode": {
              "type": "string",
              "enum": [
                "RESOURCE_NOT_FOUND"
              ]
            },
            "errorDescription": {
              "type": "string",
              "example": "The resource with id XX cannot be found"
            }
          }
        }
      }
    }
  },
  "500": {
    "description": "Internal Server Error",
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "errorCode": {
              "type": "string",
              "enum": [
                "UNEXPECTED_SERVER_ERROR"
              ]
            },
            "errorDescription": {
              "type": "string",
              "example": "The server encountered an error"
            }
          }
        }
      }
    }
  },
  "504": {
    "description": "Gateway Timeout",
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "errorCode": {
              "type": "string",
              "enum": [
                "REQUEST_TIMEOUT"
              ]
            },
            "errorDescription": {
              "type": "string",
              "example": "The server encountered a timeout"
            }
          }
        }
      }
    }
  }
}
