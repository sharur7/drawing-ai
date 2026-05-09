import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.QUBRID_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://platform.qubrid.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'wan2.7-image',
        prompt: 'Transform this hand drawing into a realistic, detailed image. Enhance colors, add textures, and create a professional-quality rendering.',
        n: 1,
        size: '1K',
        enable_sequential: false,
        response_format: 'url',
        image: `data:image/png;base64,${imageData}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Qubrid API error:', errorData);
      return NextResponse.json(
        { error: `Qubrid API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      imageUrl: data.data?.[0]?.url || data.url,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
