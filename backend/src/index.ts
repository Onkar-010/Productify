/** @format */
import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ENV.FRONTEND_URL }));

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to Productify API ; Powered by Postgres, Drizzle ORM, Cleark Auth",
    endpoints: {
      user: "/api/users",
      products: "/api/products",
      comments: "/api/comments",
    },
  });
});

app.listen(ENV.PORT, () => {
  console.log("Server is up and Running on Port:", ENV.PORT);
});
