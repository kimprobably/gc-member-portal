import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';

interface OnboardingVideoProps {
  videoUrl?: string;
  onContinue: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

const OnboardingVideo: React.FC<OnboardingVideoProps> = ({
  videoUrl,
  onContinue,
  onSkip,
  onBack,
}) => {
  const [hasWatched, setHasWatched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';

    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?enablejsapi=1`;
    }

    // Handle Loom URLs
    if (url.includes('loom.com')) {
      const loomMatch = url.match(/loom\.com\/(share|embed)\/([a-zA-Z0-9]+)/);
      if (loomMatch) {
        return `https://www.loom.com/embed/${loomMatch[2]}`;
      }
    }

    // Return as-is if already an embed URL or unknown format
    return url;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : '';

  const handlePlay = () => {
    setIsPlaying(true);
    // Mark as watched after a delay (simulating watching)
    setTimeout(() => setHasWatched(true), 3000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-sm font-medium mb-2">
          <Play className="w-4 h-4" />
          <span>Intro Video</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Meet Your Instructor
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Watch this quick introduction to learn what to expect from the bootcamp.
        </p>
      </div>

      {/* Video Player */}
      <div className="relative bg-zinc-900">
        {embedUrl ? (
          <div className="aspect-video">
            {isPlaying ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Intro Video"
              />
            ) : (
              <button
                onClick={handlePlay}
                className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
                <span className="text-white font-medium">Click to play</span>
              </button>
            )}
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-zinc-800">
            <div className="text-center">
              <p className="text-zinc-400 mb-2">Video coming soon</p>
              <p className="text-sm text-zinc-500">Your instructor will add a video here</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 md:p-8">
        {hasWatched && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>Video watched</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
          {onSkip && !hasWatched && (
            <button
              onClick={onSkip}
              className="px-6 py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium rounded-lg transition-colors"
            >
              Watch Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingVideo;
