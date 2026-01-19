import mongoose from "mongoose";

const FoundItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, lowercase: true },
    location: { type: String, required: true, lowercase: true },
    description: { type: String, lowercase: true },
    imageUrl: { type: String, required: true },
    imageHash: String,
    status: {
      type: String,
      enum: ["unclaimed", "matched", "claimed"],
      default: "unclaimed",
    },
  },
  { timestamps: true },
);

export default mongoose.models.FoundItem ||
  mongoose.model("FoundItem", FoundItemSchema);
