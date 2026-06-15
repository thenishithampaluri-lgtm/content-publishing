import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  contentId: String,
  userName: String,
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model(
  "Comment",
  commentSchema
);