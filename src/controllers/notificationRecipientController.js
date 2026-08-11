import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listNotificationRecipients,
  createNotificationRecipient,
  deleteNotificationRecipient,
} from "../services/notificationRecipientService.js";

export const getAdminNotificationRecipients = asyncHandler(async (_req, res) => {
  const recipients = await listNotificationRecipients();
  res.json(recipients);
});

export const postAdminNotificationRecipient = asyncHandler(async (req, res) => {
  const recipient = await createNotificationRecipient(req.body.email);
  res.status(201).json(recipient);
});

export const deleteAdminNotificationRecipient = asyncHandler(async (req, res) => {
  const result = await deleteNotificationRecipient(req.params.id);
  res.json(result);
});
