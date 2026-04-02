import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import {
  getAdminDonations,
  getAdminGolfers,
  getAdminPayments,
  getAdminRegistrations,
  getAdminSponsors,
  postAdminLogin,
} from "../controllers/adminController.js";
import {
  getAdminEvents,
  getAdminEventById,
  postAdminEvent,
  putAdminEvent,
  deleteAdminEvent,
} from "../controllers/adminEventController.js";
import {
  postAdminPackage,
  putAdminPackage,
  deleteAdminPackage,
} from "../controllers/adminPackageController.js";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/authAdmin.js";
import {
  adminListGalleryImages,
  adminUploadGalleryImages,
  adminDeleteGalleryImage,
} from "../controllers/galleryController.js";

export const adminRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

adminRouter.post(
  "/admin/login",
  [body("email").isEmail().normalizeEmail(), body("password").isString().notEmpty()],
  validate,
  postAdminLogin,
);

adminRouter.get("/admin/registrations", requireAdmin, getAdminRegistrations);
adminRouter.get("/admin/payments", requireAdmin, getAdminPayments);
adminRouter.get("/admin/donations", requireAdmin, getAdminDonations);
adminRouter.get("/admin/sponsors", requireAdmin, getAdminSponsors);
adminRouter.get("/admin/golfers", requireAdmin, getAdminGolfers);

// Event CRUD
adminRouter.get("/admin/events", requireAdmin, getAdminEvents);
adminRouter.get("/admin/events/:id", requireAdmin, getAdminEventById);
adminRouter.post(
  "/admin/events",
  requireAdmin,
  [
    body("name").isString().trim().notEmpty(),
    body("description").optional({ nullable: true }).isString(),
    body("date").isISO8601(),
    body("location").isString().trim().notEmpty(),
  ],
  validate,
  postAdminEvent,
);
adminRouter.put(
  "/admin/events/:id",
  requireAdmin,
  [
    body("name").optional().isString().trim().notEmpty(),
    body("description").optional({ nullable: true }).isString(),
    body("date").optional().isISO8601(),
    body("location").optional().isString().trim().notEmpty(),
  ],
  validate,
  putAdminEvent,
);
adminRouter.delete("/admin/events/:id", requireAdmin, deleteAdminEvent);

// Package CRUD
adminRouter.post(
  "/admin/packages",
  requireAdmin,
  [
    body("eventId").isString().notEmpty(),
    body("name").isString().trim().notEmpty(),
    body("description").isString().trim().notEmpty(),
    body("category").isIn(["SPONSORSHIP", "SIGNAGE", "GOLF", "DINNER", "DONATION"]),
    body("price").isInt({ min: 0 }),
    body("earlyBirdPrice").optional({ nullable: true }).isInt({ min: 0 }),
    body("earlyBirdDeadline").optional({ nullable: true }).isISO8601(),
    body("maxSlots").optional({ nullable: true }).isInt({ min: 1 }),
    body("exclusive").optional().isBoolean(),
  ],
  validate,
  postAdminPackage,
);
adminRouter.put(
  "/admin/packages/:id",
  requireAdmin,
  [
    body("name").optional().isString().trim().notEmpty(),
    body("description").optional().isString().trim().notEmpty(),
    body("category").optional().isIn(["SPONSORSHIP", "SIGNAGE", "GOLF", "DINNER", "DONATION"]),
    body("price").optional().isInt({ min: 0 }),
    body("earlyBirdPrice").optional({ nullable: true }).isInt({ min: 0 }),
    body("earlyBirdDeadline").optional({ nullable: true }).isISO8601(),
    body("maxSlots").optional({ nullable: true }).isInt({ min: 1 }),
    body("exclusive").optional().isBoolean(),
  ],
  validate,
  putAdminPackage,
);
adminRouter.delete("/admin/packages/:id", requireAdmin, deleteAdminPackage);

adminRouter.post("/admin/gallery", requireAdmin, upload.array("files", 50), adminUploadGalleryImages);
adminRouter.get("/admin/gallery", requireAdmin, adminListGalleryImages);
adminRouter.delete("/admin/gallery/:id", requireAdmin, adminDeleteGalleryImage);

