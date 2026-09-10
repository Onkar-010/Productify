/** @format */

import { Router } from "express";
import { syncData } from "../controllers/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

//endpoint to Sync the user data from Clerk to our DB
router.post("/sync", requireAuth(), syncData);

export default router;
