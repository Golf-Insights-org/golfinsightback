import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createPackage,
  updatePackage,
  deletePackage,
} from "../services/adminPackageService.js";

export const postAdminPackage = asyncHandler(async (req, res) => {
  const pkg = await createPackage(req.body);
  res.status(201).json(pkg);
});

export const putAdminPackage = asyncHandler(async (req, res) => {
  const pkg = await updatePackage(req.params.id, req.body);
  res.json(pkg);
});

export const deleteAdminPackage = asyncHandler(async (req, res) => {
  const result = await deletePackage(req.params.id);
  res.json(result);
});
