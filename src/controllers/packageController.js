import { asyncHandler } from "../utils/asyncHandler.js";
import { listPackages } from "../services/packageService.js";

export const getPackages = asyncHandler(async (req, res) => {
  const packages = await listPackages();
  res.json(packages);
});

