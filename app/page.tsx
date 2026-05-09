'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GenerationResult {
  type: 'image' | 'video';
  url: string;
  timestamp: Date;
}

export default function DrawingToAI() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setUploadedImage(base64String);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const getImageBase64 = (): string => {
    if (!uploadedImage) return '';
    return uploadedImage.split(',')[1]; // Get base64 without data URI prefix
  };

  const generateImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageData = getImageBase64();

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const data = await response.json();
      setResult({
        type: 'image',
        url: data.imageUrl,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const editImage = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageData = getImageBase64();

      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit image: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadedImage(data.imageUrl);
      setResult({
        type: 'image',
        url: data.imageUrl,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit image');
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const imageData = getImageBase64();

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate video: ${response.statusText}`);
      }

      const data = await response.json();
      setResult({
        type: 'video',
        url: data.videoUrl,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Drawing to AI
          </h1>
          <p className="text-slate-600">
            Draw something and watch AI transform it into a realistic image or video
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Upload Hand Drawing
              </h2>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!uploadedImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                >
                  <svg
                    className="w-12 h-12 text-slate-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-slate-700 font-medium">Click to upload your drawing</p>
                  <p className="text-slate-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="relative w-full max-h-96 bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Uploaded drawing"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      setUploadedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Upload Different Image
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col gap-4">
            <Card className="p-6 flex-1">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Actions
              </h2>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={editImage}
                  disabled={loading || !uploadedImage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? 'Processing...' : 'Edit Image'}
                </Button>

                <Button
                  onClick={generateImage}
                  disabled={loading || !uploadedImage}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Processing...' : 'Generate Image'}
                </Button>

                <Button
                  onClick={generateVideo}
                  disabled={loading || !uploadedImage}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? 'Processing...' : 'Generate Video'}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {result.type === 'image' ? 'Generated Image' : 'Generated Video'}
            </h2>

            {result.type === 'image' ? (
              <div className="relative w-full max-h-96">
                <img
                  src={result.url}
                  alt="Generated realistic image"
                  className="w-full rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="relative w-full">
                <video
                  src={result.url}
                  controls
                  autoPlay
                  loop
                  className="w-full rounded-lg bg-slate-900"
                />
              </div>
            )}

            <p className="text-sm text-slate-500 mt-4">
              Generated at {result.timestamp.toLocaleTimeString()}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
