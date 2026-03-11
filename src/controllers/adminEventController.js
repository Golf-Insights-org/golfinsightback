import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listAdminEvents,
  getAdminEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/adminEventService.js";

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
