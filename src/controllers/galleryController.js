import { asyncHandler } from "../utils/asyncHandler.js";
import { createGalleryImages, listGalleryImages, deleteGalleryImage } from "../services/galleryService.js";

export const adminUploadGalleryImages = asyncHandler(async (req, res) => {
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: "category is required" });
  }

  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ error: "At least one file is required" });
  }

  const created = await createGalleryImages({ category, files });
  res.status(201).json(created);
});

export const adminListGalleryImages = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const images = await listGalleryImages({ category });
  res.json(images);
});

export const adminDeleteGalleryImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteGalleryImage(id);
  res.status(204).send();
});

export const getPublicGalleryImages = asyncHandler(async (req, res) => {
  const images = await listGalleryImages();

  const grouped = {
    social: [],
    executive: [],
    oneOnOne: [],
  };

  for (const img of images) {
    if (img.category === "SOCIAL") grouped.social.push(img);
    else if (img.category === "EXECUTIVE") grouped.executive.push(img);
    else if (img.category === "ONE_ON_ONE") grouped.oneOnOne.push(img);
  }

  res.json(grouped);
});

