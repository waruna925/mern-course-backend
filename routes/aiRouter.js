import express from "express";
import { recommendLaptop } from "../controllers/aiController.js";

const router = express.Router();

router.post("/recommend", recommendLaptop);

export default router;