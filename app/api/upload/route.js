import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    // DEBUG LOGGER: This will print directly in your VS Code terminal
    console.log("🛠️ SENT CLOUD NAME:", cloudName);
    console.log("🛠️ SENT UPLOAD PRESET:", uploadPreset);

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Missing Cloudinary credentials. Did you restart the terminal?" }, { status: 500 });
    }

    const cloudinaryData = new FormData();
    cloudinaryData.append("file", file);
    cloudinaryData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryData,
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Invalid response from Cloudinary" }, { status: 500 });
    }

    if (response.ok && result.secure_url) {
      return NextResponse.json({ url: result.secure_url });
    } else {
      return NextResponse.json(
        { error: result.error?.message || "Cloudinary upload failed" }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}