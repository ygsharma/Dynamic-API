import express, { Router } from "express";
import * as clientController from "../modules/client";
import { verifyApiKey } from "../modules/api/api.middleware";

const router: Router = express.Router();

router.route("/*").all(verifyApiKey, clientController.clientApi);

export default router;
