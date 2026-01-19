import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code", { status: 400 });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.id_token) {
    console.error("Google token error:", tokens);
    return new Response("Google auth failed", { status: 400 });
  }

  const decoded = jwt.decode(tokens.id_token);

  await connectDB();

  let user = await User.findOne({ googleId: decoded.sub });

  if (!user) {
    user = await User.create({
      googleId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.picture,
    });
  }

  // 🔐 CREATE SESSION TOKEN
  const sessionToken = jwt.sign(
    {
      email: user.email,
      name: user.name,
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  // 🔐 SET COOKIE (THIS WAS MISSING)
  const redirectUrl = new URL("/matches", req.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    path: "/", // 🔴 critical
    sameSite: "lax",
  });

  return response;
}
