import express, { Router } from "express";
import * as apiController from "../modules/api";
import validate from "../modules/validate/validate.middleware";
import { apiGenerate } from "../modules/api/api.validation";
import { verifyApiKey, verifyToken } from "../modules/api/api.middleware";

const router: Router = express.Router();

router
  .route("/generate")
  .post(verifyToken, validate(apiGenerate), apiController.generateApi);

router.route("/health").get(apiController.healthApi);

router.route("/fetch-open-api-json").get(apiController.getOpenApiJson);

router
  .route("/save-changes")
  .post(verifyToken, validate(apiGenerate), apiController.saveChanges);

router.route("/save-changes").get(verifyToken, apiController.fetchSaveChanges);

router.route("/delete-api").delete(verifyToken, apiController.deleteApi);

export default router;
