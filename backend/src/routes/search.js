import { Router } from "express";
import { z } from "zod";

import { validateBody } from "../middleware/validate.js";
import { tavilySearch } from "../services/tavily.js";
import { sanitizeText } from "../utils/sanitize.js";

const router = Router();

const searchSchema = z.object({
  query: z.string().min(1).max(400),
  maxResults: z.number().int().min(1).max(10).optional(),
  includeAnswer: z.boolean().optional(),
});

router.post("/", validateBody(searchSchema), async (req, res, next) => {
  try {
    const data = await tavilySearch({
      query: sanitizeText(req.body.query, 400),
      maxResults: req.body.maxResults ?? 5,
      includeAnswer: req.body.includeAnswer ?? true,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
