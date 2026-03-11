import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { uploadImageFromBuffer } from "../utils/cloudinary.js";

export async function createGalleryImages({ category, files }) {
  const uploads = await Promise.all(
    files.map(async (file) => {
      const { url } = await uploadImageFromBuffer(file.buffer, env.CLOUDINARY_FOLDER);
      return prisma.galleryImage.create({
        data: {
          category,
          url,
          alt: file.originalname,
        },
      });
    }),
  );

  return uploads;
}

export async function listGalleryImages({ category } = {}) {
  const where = category ? { category } : {};
  return prisma.galleryImage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteGalleryImage(id) {
  return prisma.galleryImage.delete({
    where: { id },
  });
}

