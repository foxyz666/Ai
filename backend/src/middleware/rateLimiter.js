import rateLimit from "express-rate-limit";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const max = Number(process.env.RATE_LIMIT_MAX) || 30;

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: "Too many requests. Please slow down and try again shortly." },
  },
});
