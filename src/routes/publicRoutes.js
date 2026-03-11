import { Router } from "express";
import { body } from "express-validator";
import { getPackages } from "../controllers/packageController.js";
import { getEvent, getEvents } from "../controllers/eventController.js";
import { getRegistration, postRegistration } from "../controllers/registrationController.js";
import { postCreatePayment } from "../controllers/paymentController.js";
import { getPublicGalleryImages } from "../controllers/galleryController.js";
import { validate } from "../middleware/validate.js";
import { paymentRateLimiter } from "../middleware/rateLimit.js";

export const publicRouter = Router();

publicRouter.get("/packages", getPackages);
publicRouter.get("/events", getEvents);
publicRouter.get("/events/:id", getEvent);
publicRouter.get("/gallery", getPublicGalleryImages);

publicRouter.post(
  "/registrations",
  [
    body("packageId").isString().notEmpty(),
    body("name").isString().trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("phone").isString().trim().notEmpty(),
    body("address").isString().trim().notEmpty(),
    body("city").isString().trim().notEmpty(),
    body("state").isString().trim().notEmpty(),
    body("zip").isString().trim().notEmpty(),
    body("donationAmount").optional().isInt({ min: 1 }),
    body("golfers").optional().isArray({ max: 8 }),
    body("golfers.*.name").optional().isString().trim().notEmpty(),
    body("golfers.*.email").optional().isEmail().normalizeEmail(),
  ],
  validate,
  postRegistration,
);

publicRouter.get("/registrations/:id", getRegistration);

publicRouter.post(
  "/payments/create",
  paymentRateLimiter,
  [body("registrationId").isString().notEmpty()],
  validate,
  postCreatePayment,
);

