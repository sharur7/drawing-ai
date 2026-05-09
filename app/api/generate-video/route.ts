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

    const response = await fetch('https://platform.qubrid.com/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'p-video',
        prompt: 'Create a dynamic video from this hand drawing. Animate the scene with smooth motion, add life and movement to the sketch, enhance colors and details to create a cinematic, engaging video.',
        duration: 5,
        resolution: '720p',
        fps: 24,
        aspect_ratio: '16:9',
        image: `data:image/png;base64,${imageData}`,
        draft: false,
        save_audio: true,
        prompt_upsampling: true,
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
      videoUrl: data.data?.[0]?.video_url || data.video_url,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
