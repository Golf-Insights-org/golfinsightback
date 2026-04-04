import { asyncHandler } from "../utils/asyncHandler.js";
import { listEvents, getEventWithPackagesById, getIndexFeaturedEvent } from "../services/eventService.js";

export const getEvents = asyncHandler(async (req, res) => {
  const events = await listEvents();
  res.json(events);
});

export const getIndexFeaturedEventPublic = asyncHandler(async (_req, res) => {
  const event = await getIndexFeaturedEvent();
  res.json(event ?? null);
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await getEventWithPackagesById(req.params.id);
  res.json(event);
});

