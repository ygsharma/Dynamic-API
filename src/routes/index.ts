import express, { Router } from "express";
import apiRoute from "./api.route";
import clientRoute from "./client.route";
import conversionRoute from "./conversion.route";
import config from "../config/config";

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: "/client",
    route: clientRoute,
  },
  {
    path: "/api",
    route: apiRoute,
  },
  {
    path: "/convert",
    route: conversionRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
