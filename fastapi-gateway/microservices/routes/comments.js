import express from "express";
import Comment from "../models/Comment.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const comments = await Comment.find();

  res.json(comments);
});

router.get("/:contentId", async (req, res) => {
  const comments = await Comment.find({
    contentId: req.params.contentId
  });

  res.json(comments);
});

router.post("/", async (req, res) => {
  const comment = await Comment.create(req.body);

  res.status(201).json(comment);
});

router.put("/:id", async (req, res) => {
  const updated = await Comment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Comment.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "Deleted"
  });
});

export default router;