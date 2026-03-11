import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import {
  getAdminGolfers,
  getAdminPayments,
  getAdminRegistrations,
  getAdminSponsors,
  postAdminLogin,
} from "../controllers/adminController.js";
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
adminRouter.get("/admin/sponsors", requireAdmin, getAdminSponsors);
adminRouter.get("/admin/golfers", requireAdmin, getAdminGolfers);

adminRouter.post("/admin/gallery", requireAdmin, upload.array("files", 50), adminUploadGalleryImages);
adminRouter.get("/admin/gallery", requireAdmin, adminListGalleryImages);
adminRouter.delete("/admin/gallery/:id", requireAdmin, adminDeleteGalleryImage);

