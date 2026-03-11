import { asyncHandler } from "../utils/asyncHandler.js";
import { adminLogin, listGolfers, listPayments, listRegistrations, listSponsors } from "../services/adminService.js";

export const postAdminLogin = asyncHandler(async (req, res) => {
  const result = await adminLogin({ email: req.body.email, password: req.body.password });
  res.json(result);
});

export const getAdminRegistrations = asyncHandler(async (req, res) => {
  const result = await listRegistrations({ query: req.query });
  res.json(result);
});

export const getAdminPayments = asyncHandler(async (req, res) => {
  const result = await listPayments({ query: req.query });
  res.json(result);
});

export const getAdminSponsors = asyncHandler(async (req, res) => {
  const result = await listSponsors();
  res.json(result);
});

export const getAdminGolfers = asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await listGolfers({ format });
  res.type(result.contentType).send(result.body);
});

