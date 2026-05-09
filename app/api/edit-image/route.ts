import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.QUBRID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'QUBRID_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Create FormData for multipart request
    const form = new FormData();
    form.append('model', 'qwen-image-2.0');
    form.append(
      'prompt',
      'Transform this hand drawing into a highly realistic, detailed, and professional-quality image. Enhance all elements with photorealistic textures, vibrant colors, proper lighting, shadows, and depth. Add cinematic lighting, fine details, and refine any rough sketches into polished artwork. Preserve the original composition and intent while making it look like a professional photograph or high-quality digital art.'
    );
    form.append('n', '1');
    form.append('size', '1024*1024');
    form.append('negative_prompt', 'blurry, low quality, sketch, drawing');
    form.append('prompt_extend', 'true');
    form.append('watermark', 'false');
    form.append('seed', '0');
    form.append('response_format', 'url');

    // Convert base64 to blob and append
    const binaryString = atob(imageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    form.append('files', blob, 'image.png');

    const response = await fetch('https://platform.qubrid.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: form,
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
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
