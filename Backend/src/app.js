import express from "express";
import { createServer } from "node:http";

import mongoose from "mongoose";

import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js"

const app = express();
const server = createServer(app);
const rawCorsOrigins =
  process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174";
const corsOrigins = rawCorsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOriginConfig = corsOrigins.includes("*") ? true : corsOrigins;

connectToSocket(server, corsOriginConfig);

app.set("port", process.env.PORT || 8000);
app.use(cors({ origin: corsOriginConfig, credentials: true }));
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit : "40kb" , extended : true}));

app.use("/api/v1/users" , userRoutes)

app.get("/home", (req, res) => {
  return res.json("Heelo bhaiyo");
});

const start = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voxora";
    const connectionDB = await mongoose.connect(mongoUri);

    console.log(`MONGO Connected to DB host : ${connectionDB.connection.host}`)
    server.listen(app.get("port"), () => {
      console.log(`App is listening to Port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

start();
