import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./db.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/comments", commentRoutes);

connectDB();

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});