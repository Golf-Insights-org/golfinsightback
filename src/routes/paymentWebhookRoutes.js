import { Router } from "express";
import { postWebhook } from "../controllers/paymentController.js";

export const webhookRouter = Router();

webhookRouter.post("/", postWebhook);

