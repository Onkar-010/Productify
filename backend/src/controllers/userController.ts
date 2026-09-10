/** @format */
import type { Request, Response } from "express";

import * as queries from "../db/quires";

import { getAuth } from "@clerk/express";

export async function syncData(req: Request, res: Response) {
  try {
    // Authenticating
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    //getting Data from req.body
    const { email, name, imageUrl } = req.body;

    if (!email || !name || !imageUrl) {
      return res
        .status(400)
        .json({ error: "Email, name, and imageUrl are required" });
    }

    //Setting user into db and cleark
    const user = queries.upsertUser({
      id: userId,
      email,
      name,
      imageUrl,
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
}
