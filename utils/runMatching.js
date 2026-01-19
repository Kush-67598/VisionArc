import LostItem from "@/models/LostItem";
import Match from "@/models/Match";
import { computeScore } from "./computeScore";
import { hammingDistance } from "./imageHash";

export async function runMatching(foundItem) {
  // Only consider lost items from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const lostItems = await LostItem.find({
    category: foundItem.category,
    status: "open",
    createdAt: { $gte: thirtyDaysAgo },
  });

  for (const lost of lostItems) {
    let score = computeScore(lost, foundItem);

    // Image similarity (only if both have hashes)
    if (lost.imageHash && foundItem.imageHash) {
      const dist = hammingDistance(lost.imageHash, foundItem.imageHash);
      if (dist < 10) score += 20;
    }

    if (score >= 60) {
      await Match.create({
        lostItemId: lost._id,
        foundItemId: foundItem._id,
        score,
      });

      await LostItem.findByIdAndUpdate(lost._id, {
        status: "matched",
      });
    }
  }
}
