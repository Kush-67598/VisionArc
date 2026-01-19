import connectDB from "@/lib/db";
import Match from "@/models/Match";
import FoundItem from "@/models/FoundItem";
import LostItem from "@/models/LostItem";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

/* ---------- HELPERS ---------- */

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((w) => w.length > 2);
}

/* ---------- MAILER ---------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------- API ---------- */

export async function POST(req) {
  /* 🔐 AUTH CHECK */
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

  /* 🔌 DB */
  await connectDB();

  /* 📦 BODY */
  const { matchId, proof } = await req.json();

  if (!matchId || !proof) {
    return new Response("Invalid input", { status: 400 });
  }

  /* 🔎 MATCH */
  const match = await Match.findById(matchId);
  if (!match) {
    return new Response("Match not found", { status: 404 });
  }

  if (match.status === "accepted") {
    return new Response("Already claimed", { status: 400 });
  }

  /* 🔎 LOST ITEM */
  const lost = await LostItem.findById(match.lostItemId);
  if (!lost) {
    return new Response("Lost item not found", { status: 404 });
  }

  /* 🧠 PROOF VALIDATION (FIXED) */
  const lostWords = normalize(
    `${lost.name || ""} ${lost.category || ""} ${lost.description || ""}`
  );

  const proofWords = normalize(proof || "");
  const overlap = proofWords.filter((w) => lostWords.includes(w));

  if (proofWords.length < 3) {
    return new Response("Proof too vague", { status: 400 });
  }

  if (overlap.length < 1) {
    return new Response("Claim proof does not match", { status: 400 });
  }

  /* ✅ ACCEPT CLAIM */
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

  /* 📧 EMAIL USER */
  try {
    await transporter.sendMail({
      from: `"Campus Lost & Found" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your lost item has been verified",
      html: `
        <p>Hello ${user.name || ""},</p>

        <p>Your claim for <strong>${lost.name || "your item"}</strong> has been successfully verified.</p>

        <p>Please collect your item from the <strong>Security Office</strong> with a valid ID.</p>

        <p>Thank you,<br/>Campus Lost & Found Team</p>
      `,
    });
  } catch (err) {
    console.error("Email error:", err);
    // Do NOT block success on email failure
  }

  return Response.json({ success: true });
}
