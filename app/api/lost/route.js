import connectDB from "@/lib/db";
import LostItem from "@/models/LostItem";
export async function POST(req) {
  await connectDB();
  const data = await req.json();
  const lost = await LostItem.create(data);
  return Response.json(lost);
}
