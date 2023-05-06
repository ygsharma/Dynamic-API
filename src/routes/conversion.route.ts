import express, { Router } from "express";
import * as conversionController from "../modules/conversion";

const router: Router = express.Router();

router
    .route("/to-tree-format")
    .post(conversionController.convertToTreeFormat);

// router.route("/health").get(conversionController.healthApi);

export default router;
