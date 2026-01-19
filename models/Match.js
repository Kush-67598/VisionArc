import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
  {
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostItem",
      required: true,
    },

    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoundItem",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    // 🔐 Ownership proof (human verification)
    claimProof: {
      type: String,
    },

    // 🧑‍🎓 Google-authenticated claimant
    claimedByEmail: {
      type: String,
    },

    claimedByName: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Match ||
  mongoose.model("Match", MatchSchema);
