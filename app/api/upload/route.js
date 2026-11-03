import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESE ||
      process.env.CLOUDINARY_UPLOAD_PRESET;

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local' },
        { status: 500 }
      );
    }

    const incomingFormData = await request.formData();
    const file = incomingFormData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);

    // 1. Use Unsigned Upload Preset if configured
    if (uploadPreset) {
      cloudinaryFormData.append('upload_preset', uploadPreset);
    }
    // 2. Fallback to Signed Upload if API Key & Secret are configured
    else if (apiKey && apiSecret) {
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      const signature = crypto
        .createHash('sha1')
        .update(`timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

      cloudinaryFormData.append('api_key', apiKey);
      cloudinaryFormData.append('timestamp', timestamp);
      cloudinaryFormData.append('signature', signature);
    } else {
      return NextResponse.json(
        {
          error:
            'Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local. Did you restart the terminal?',
        },
        { status: 500 }
      );
    }

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Cloudinary upload failed' },
        { status: uploadRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      secure_url: data.secure_url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error during upload' },
      { status: 500 }
    );
  }
}