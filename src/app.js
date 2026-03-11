import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { apiRateLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { publicRouter } from "./routes/publicRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { webhookRouter } from "./routes/paymentWebhookRoutes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(apiRateLimiter);

  // Stripe webhook must receive the raw request body for signature verification
  app.use(
    "/payments/webhook",
    express.raw({
      type: "application/json",
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    }),
    webhookRouter,
  );

  // Source - https://stackoverflow.com/a/72189302
  // Posted by Jerud, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-03-11, License - CC BY-SA 4.0
  app.use(
    express.json({
      limit: "50mb",
      verify: (req, res, buf) => {
        // keep for debugging/support, not for Stripe
        req.jsonBody = buf;
      },
    }),
  );

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use(publicRouter);
  app.use(adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

