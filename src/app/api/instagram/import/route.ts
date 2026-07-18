import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('instagram.com/p/')) {
      return NextResponse.json({ error: 'URL de Instagram inválida (debe contener instagram.com/p/)' }, { status: 400 });
    }

    const oembedUrl = `https://graph.facebook.com/v25.0/instagram_oembed?url=${encodeURIComponent(url)}`;

    const response = await fetch(oembedUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Instagram oEmbed Error:", errData);
      return NextResponse.json({ error: 'No se pudo obtener la publicación (puede ser privada, restringida o requerir token de Meta)' }, { status: 400 });
    }

    const data = await response.json();

    let thumbnail_base64 = null;
    if (data.thumbnail_url) {
      try {
        const imgRes = await fetch(data.thumbnail_url);
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
        thumbnail_base64 = `data:${mimeType};base64,${base64}`;
      } catch (e) {
        console.error("Error fetching instagram thumbnail:", e);
      }
    }

    return NextResponse.json({
      success: true,
      html: data.html,
      thumbnail_url: data.thumbnail_url,
      thumbnail_base64,
      description: data.title || '',
      url: url
    });

  } catch (error) {
    console.error("Instagram Import API Error:", error);
    return NextResponse.json({ error: 'Error al procesar el link de Instagram' }, { status: 500 });
  }
}
