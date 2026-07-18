import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('instagram.com/p/')) {
      return NextResponse.json({ error: 'URL de Instagram inválida (debe contener instagram.com/p/)' }, { status: 400 });
    }

    // Limpiar parámetros extra (como ?img_index=1) que rompen la extracción
    const cleanUrl = url.split('?')[0];

    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}`;

    const response = await fetch(apiUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error("Microlink Error:", errData);
      return NextResponse.json({ error: 'No se pudo obtener la publicación de Instagram (puede ser privada)' }, { status: 400 });
    }

    const json = await response.json();
    const data = json.data || {};

    // Limpiar el texto extra que agrega Microlink ("X likes - user on Date: “Texto”")
    let rawDescription = data.description || '';
    const descMatch = rawDescription.match(/“([\s\S]*?)”\.?$/);
    if (descMatch) {
      rawDescription = descMatch[1];
    }

    let thumbnail_url = data.image?.url || null;
    let thumbnail_base64 = null;
    
    if (thumbnail_url) {
      try {
        const imgRes = await fetch(thumbnail_url);
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
      thumbnail_url: thumbnail_url,
      thumbnail_base64,
      description: rawDescription,
      url: url
    });

  } catch (error) {
    console.error("Instagram Import API Error:", error);
    return NextResponse.json({ error: 'Error al procesar el link de Instagram' }, { status: 500 });
  }
}
