import { Router } from "express";
import { FREE_MODELS } from "../services/openrouter.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    models: FREE_MODELS,
    default: process.env.DEFAULT_MODEL || FREE_MODELS[0].id,
  });
});

export default router;
