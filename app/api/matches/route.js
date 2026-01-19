import connectDB from "@/lib/db";
import LostItem from "@/models/LostItem";
import FoundItem from "@/models/FoundItem";
import Match from "@/models/Match";

/* ----------------- helpers ----------------- */
function norm(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ");
}

function wordOverlap(a = "", b = "") {
  const A = new Set(norm(a).split(" "));
  const B = new Set(norm(b).split(" "));
  let count = 0;
  for (const w of A) if (B.has(w)) count++;
  return count;
}

/* ----------------- scoring ----------------- */
function calculateScore(lost, found) {
  let score = 0;

  // category match (strong signal)
  if (norm(lost.category) === norm(found.category)) {
    score += 50;
  }

  // location match (loose)
  if (
    norm(lost.location).includes(norm(found.location)) ||
    norm(found.location).includes(norm(lost.location))
  ) {
    score += 30;
  }

  // description overlap (human language)
  const overlap = wordOverlap(lost.description, found.description);
  if (overlap >= 2) {
    score += 20;
  }

  return Math.min(score, 100);
}

/* ----------------- API ----------------- */
export async function GET() {
  await connectDB();

  const lostItems = await LostItem.find();
  const foundItems = await FoundItem.find();

  for (const lost of lostItems) {
    for (const found of foundItems) {
      // cheap filter
      if (norm(lost.category) !== norm(found.category)) continue;

      const score = calculateScore(lost, found);

      // 🔑 LOWERED THRESHOLD
      if (score >= 50) {
        const exists = await Match.findOne({
          lostItemId: lost._id,
          foundItemId: found._id,
        });

        if (!exists) {
          await Match.create({
            lostItemId: lost._id,
            foundItemId: found._id,
            score,
            status: "pending",
          });
        }
      }
    }
  }

  const populatedMatches = await Match.find()
    .populate("lostItemId")
    .populate("foundItemId")
    .sort({ score: -1 });

  return Response.json(populatedMatches);
}
