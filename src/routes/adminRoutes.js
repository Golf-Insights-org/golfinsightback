import { Router } from "express";
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

export const adminRouter = Router();

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

