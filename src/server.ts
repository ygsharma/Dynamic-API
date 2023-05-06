import express, { Express, Request, Response } from "express";

import helmet from "helmet";
import cors from "cors";

import routes from "./routes";
import ApiError from "./modules/errors/ApiError";
import httpStatus from "http-status";
import { errorConverter, errorHandler } from "./modules/errors/error";

const app: Express = express();

// set security HTTP headers
app.use(helmet());

app.use(cors());
app.options("*", cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
