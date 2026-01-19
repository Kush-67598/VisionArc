import connectDB from "@/lib/db";
import Match from "@/models/Match";
import FoundItem from "@/models/FoundItem";
import LostItem from "@/models/LostItem";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 2);
}

export async function POST(req) {
  // 🔐 AUTH CHECK — MUST BE FIRST
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  let user;
  try {
    user = jwt.verify(session.value, process.env.JWT_SECRET);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  // 🔌 DB CONNECT
  await connectDB();

  // 📦 BODY
  const { matchId, proof } = await req.json();

  if (!matchId || !proof) {
    return new Response("Invalid input", { status: 400 });
  }

  // 🔎 FETCH MATCH
  const match = await Match.findById(matchId);
  if (!match) {
    return new Response("Match not found", { status: 404 });
  }

  if (match.status === "accepted") {
    return new Response("Already claimed", { status: 400 });
  }

  // 🔎 FETCH LOST ITEM
  const lost = await LostItem.findById(match.lostItemId);
  if (!lost) {
    return new Response("Lost item not found", { status: 404 });
  }

  // 🧠 PROOF CHECK
  const lostWords = normalize(lost.description || "");
  const proofWords = normalize(proof || "");
  const overlap = proofWords.filter((w) => lostWords.includes(w));

  if (overlap.length < 2) {
    return new Response("Claim proof does not match", { status: 400 });
  }

  // ✅ ACCEPT CLAIM
  await Match.findByIdAndUpdate(matchId, {
    status: "accepted",
    claimProof: proof,
    claimedByEmail: user.email,
    claimedByName: user.name,
  });

  await FoundItem.findByIdAndUpdate(match.foundItemId, {
    status: "claimed",
  });

  await LostItem.findByIdAndUpdate(match.lostItemId, {
    status: "claimed",
  });

  return Response.json({ success: true });
}
