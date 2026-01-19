import connectDB from "@/lib/db";
import LostItem from "@/models/LostItem";
import FoundItem from "@/models/FoundItem";
import Match from "@/models/Match";

// Simple scoring function (keep it dumb and explainable)
function calculateScore(lost, found) {
  let score = 0;

  if (lost.category === found.category) score += 50;
  if (lost.location === found.location) score += 30;

  if (
    lost.description &&
    found.description &&
    lost.description.includes(found.description)
  ) {
    score += 20;
  }

  return Math.min(score, 100);
}

export async function GET() {
  await connectDB();

  // Fetch items
  const lostItems = await LostItem.find();
  const foundItems = await FoundItem.find();

  const matches = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      // Basic filter (cheap + effective)
      if (lost.category !== found.category) continue;

      const score = calculateScore(lost, found);

      if (score >= 60) {
        // Check if match already exists
        let match = await Match.findOne({
          lostItemId: lost._id,
          foundItemId: found._id,
        });

        if (!match) {
          match = await Match.create({
            lostItemId: lost._id,
            foundItemId: found._id,
            score,
            status: "pending",
          });
        }

        matches.push(match);
      }
    }
  }

  // Populate for frontend
  const populatedMatches = await Match.find()
    .populate("lostItemId")
    .populate("foundItemId")
    .sort({ score: -1 });

  return Response.json(populatedMatches);
}
