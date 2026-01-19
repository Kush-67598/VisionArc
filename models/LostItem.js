import mongoose from "mongoose";

const LostItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  color: {
    type: String,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    lowercase: true,
    trim: true,
  },
  dateLost: String,
});

export default mongoose.models.LostItem ||
  mongoose.model("LostItem", LostItemSchema);
