import connectDB  from "@/lib/db";
import FoundItem from "@/models/FoundItem";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  await connectDB();

  const items = await FoundItem.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .select("category location imageUrl createdAt");

  return Response.json(items);
}

export async function POST(req) {
  await connectDB();

  const { category, location, description, imageBase64 } = await req.json();

  let imageUrl = "";

  // Upload image if provided
  if (imageBase64) {
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "lost-found",
      resource_type: "image",
    });

    imageUrl = uploadResult.secure_url;
  }

  const foundItem = await FoundItem.create({
    category,
    location,
    description,
    imageUrl,
  });

  return Response.json(foundItem);
}
