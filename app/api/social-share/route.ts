import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const {
      title,
      link,
      imageUrl,
      excerpt,
      platforms = { facebook: true, pinterest: true, instagram: false },
    } = await req.json();

    const WEBHOOK_URL = process.env.SOCIAL_WEBHOOK_URL;
    const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
    const FB_PAGE_ID = process.env.FB_PAGE_ID;
    const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
    const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
    const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;

    const message = `New Guide Alert! 🛠️✨\n\n${title}\n\n${
      excerpt ? `${excerpt}\n\n` : ''
    }Read the full guide here: ${link}`;

    const results: Record<string, any> = {};

    // METHOD A: Make.com / Zapier Webhook (Easiest, no developer app review needed)
    if (WEBHOOK_URL) {
      const whRes = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          link,
          imageUrl,
          excerpt: excerpt || title,
          message,
          platforms,
          publishedAt: new Date().toISOString(),
        }),
      });
      results.webhook = whRes.ok ? 'sent' : `error_${whRes.status}`;
    }

    // METHOD B: Direct Facebook Graph API (if tokens are set)
    if (platforms.facebook && PAGE_ACCESS_TOKEN && FB_PAGE_ID) {
      const fbRes = await fetch(
        `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            link,
            access_token: PAGE_ACCESS_TOKEN,
          }),
        }
      );
      results.facebook = await fbRes.json();
    }

    // METHOD C: Direct Instagram Graph API (if tokens are set)
    if (platforms.instagram && PAGE_ACCESS_TOKEN && IG_ACCOUNT_ID && imageUrl) {
      const igContainerRes = await fetch(
        `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: message,
            access_token: PAGE_ACCESS_TOKEN,
          }),
        }
      );
      const igContainer = await igContainerRes.json();
      if (igContainer.id) {
        const igPublishRes = await fetch(
          `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: igContainer.id,
              access_token: PAGE_ACCESS_TOKEN,
            }),
          }
        );
        results.instagram = await igPublishRes.json();
      }
    }

    // METHOD D: Direct Pinterest v5 API (if tokens are set)
    if (
      platforms.pinterest &&
      PINTEREST_ACCESS_TOKEN &&
      PINTEREST_BOARD_ID &&
      imageUrl
    ) {
      const pinRes = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PINTEREST_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: PINTEREST_BOARD_ID,
          title: title.slice(0, 100),
          description: (excerpt || title).slice(0, 500),
          link,
          media_source: {
            source_type: 'image_url',
            url: imageUrl,
          },
        }),
      });
      results.pinterest = await pinRes.json();
    }

    if (Object.keys(results).length === 0) {
      return NextResponse.json(
        {
          error:
            'No social credentials found. Add SOCIAL_WEBHOOK_URL (or Meta/Pinterest tokens) to .env.local and Vercel.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Social share error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}