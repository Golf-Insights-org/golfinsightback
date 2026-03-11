import { asyncHandler } from "../utils/asyncHandler.js";
import { listEvents, getEventWithPackagesById } from "../services/eventService.js";

export const getEvents = asyncHandler(async (req, res) => {
  const events = await listEvents();
  res.json(events);
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await getEventWithPackagesById(req.params.id);
  res.json(event);
});

