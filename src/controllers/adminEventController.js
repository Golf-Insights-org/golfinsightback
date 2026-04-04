import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { uploadImageFromBuffer } from "../utils/cloudinary.js";
import {
  listAdminEvents,
  getAdminEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventCoverImage,
} from "../services/adminEventService.js";

function eventCoverUploadFolder() {
  const f = env.CLOUDINARY_FOLDER;
  if (f.endsWith("/gallery") || f.endsWith("gallery")) {
    return f.replace(/\/?gallery\/?$/, "/events");
  }
  return `${f.replace(/\/$/, "")}/events`;
}

export const getAdminEvents = asyncHandler(async (req, res) => {
  const events = await listAdminEvents();
  res.json(events);
});

export const getAdminEventById = asyncHandler(async (req, res) => {
  const event = await getAdminEvent(req.params.id);
  res.json(event);
});

export const postAdminEvent = asyncHandler(async (req, res) => {
  const event = await createEvent(req.body);
  res.status(201).json(event);
});

export const putAdminEvent = asyncHandler(async (req, res) => {
  const event = await updateEvent(req.params.id, req.body);
  res.json(event);
});

export const deleteAdminEvent = asyncHandler(async (req, res) => {
  const result = await deleteEvent(req.params.id);
  res.json(result);
});

export const postAdminEventCoverImage = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file?.buffer) {
    return res.status(400).json({ error: "file is required" });
  }
  const { url } = await uploadImageFromBuffer(file.buffer, eventCoverUploadFolder());
  const event = await updateEventCoverImage(req.params.id, url);
  res.json(event);
});
